from __future__ import annotations

import re
import sys
import zipfile
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET

from lxml import html
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image as RLImage
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer
from PIL import Image as PILImage


CONTAINER_NS = {"c": "urn:oasis:names:tc:opendocument:xmlns:container"}
OPF_NS = {"opf": "http://www.idpf.org/2007/opf", "dc": "http://purl.org/dc/elements/1.1/"}
XHTML_NS = {"xhtml": "http://www.w3.org/1999/xhtml"}


@dataclass
class ExtractedBook:
    title: str
    lines: list[str]
    sections: list[list[tuple[str, str]]]
    links: list[tuple[str, str]]
    images: list[tuple[str, bytes, tuple[int, int]]]


def clean_text(value: str) -> str:
    value = value.replace("\xa0", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def safe_name(path: Path) -> str:
    stem = re.sub(r"[^A-Za-z0-9._ -]+", "", path.stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    return stem or "converted_epub"


def resolve_href(base: Path, href: str) -> str:
    return str((base / href).resolve()).replace(str(Path("/").resolve()) + "/", "")


def find_opf_path(zf: zipfile.ZipFile) -> str:
    root = ET.fromstring(zf.read("META-INF/container.xml"))
    rootfile = root.find(".//c:rootfile", CONTAINER_NS)
    if rootfile is None:
        raise ValueError("EPUB container has no rootfile entry")
    return rootfile.attrib["full-path"]


def spine_item_paths(zf: zipfile.ZipFile, opf_path: str) -> tuple[str, list[str]]:
    root = ET.fromstring(zf.read(opf_path))
    title_el = root.find(".//dc:title", OPF_NS)
    title = clean_text(title_el.text or "") if title_el is not None else ""

    manifest = {}
    for item in root.findall(".//opf:manifest/opf:item", OPF_NS):
        item_id = item.attrib.get("id")
        href = item.attrib.get("href")
        if item_id and href:
            manifest[item_id] = href

    opf_dir = Path(opf_path).parent
    paths = []
    for itemref in root.findall(".//opf:spine/opf:itemref", OPF_NS):
        item_id = itemref.attrib.get("idref")
        href = manifest.get(item_id or "")
        if not href:
            continue
        candidate = (opf_dir / href).as_posix()
        if candidate in zf.namelist() and candidate.lower().endswith((".xhtml", ".html", ".htm")):
            paths.append(candidate)
    return title, paths


def text_from_element(node) -> str:
    return clean_text(" ".join(part for part in node.itertext()))


def iter_content_nodes(doc) -> Iterable[tuple[str, str]]:
    body = doc.find(".//body")
    if body is None:
        body = doc

    block_tags = {
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "li",
        "blockquote",
        "pre",
        "td",
        "th",
    }
    skip_ancestor_tags = {"script", "style", "nav"}

    for node in body.iter():
        tag = node.tag
        if not isinstance(tag, str):
            continue
        tag = tag.split("}")[-1].lower()
        if tag in skip_ancestor_tags:
            continue
        if tag not in block_tags:
            continue
        if any(
            isinstance(parent.tag, str) and parent.tag.split("}")[-1].lower() in skip_ancestor_tags
            for parent in node.iterancestors()
        ):
            continue
        text = text_from_element(node)
        if not text:
            continue
        if tag == "li":
            text = f"- {text}"
        elif tag in {"td", "th"}:
            text = f"{text}"
        yield tag, text


def extract_epub(path: Path) -> ExtractedBook:
    with zipfile.ZipFile(path) as zf:
        opf_path = find_opf_path(zf)
        title, spine_paths = spine_item_paths(zf, opf_path)
        title = title or path.stem
        links: list[tuple[str, str]] = []
        images: list[tuple[str, bytes, tuple[int, int]]] = []

        sections: list[list[tuple[str, str]]] = []
        all_lines: list[str] = [title, ""]
        seen_recent: list[str] = []

        for spine_path in spine_paths:
            raw = zf.read(spine_path)
            doc = html.fromstring(raw)
            section: list[tuple[str, str]] = []
            for anchor in doc.findall(".//a"):
                href = clean_text(anchor.attrib.get("href", ""))
                label = text_from_element(anchor) or href
                if href and (label, href) not in links:
                    links.append((label, href))
                    all_lines.append(f"Link: {label} -> {href}")
            for img in doc.findall(".//img"):
                src = img.attrib.get("src", "")
                alt = clean_text(img.attrib.get("alt", "")) or Path(src).name
                img_path = (Path(spine_path).parent / src).as_posix()
                if img_path in zf.namelist():
                    data = zf.read(img_path)
                    with PILImage.open(BytesIO(data)) as image:
                        size = image.size
                    images.append((alt, data, size))
                    all_lines.append(f"Image: {alt} ({size[0]}x{size[1]})")
            for tag, text in iter_content_nodes(doc):
                # Avoid duplicate parent/child captures that sometimes appear in EPUB XHTML.
                if text in seen_recent:
                    continue
                seen_recent.append(text)
                seen_recent = seen_recent[-12:]
                section.append((tag, text))
                all_lines.append(text)
            if section:
                sections.append(section)
                all_lines.append("")

    return ExtractedBook(title=title, lines=all_lines, sections=sections, links=links, images=images)


def make_styles():
    base = getSampleStyleSheet()
    body = ParagraphStyle(
        "Body",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        spaceAfter=7,
    )
    bullet = ParagraphStyle(
        "Bullet",
        parent=body,
        leftIndent=16,
        firstLineIndent=-8,
    )
    h1 = ParagraphStyle(
        "Heading1Custom",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1F2937"),
        spaceBefore=12,
        spaceAfter=10,
    )
    h2 = ParagraphStyle(
        "Heading2Custom",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#374151"),
        spaceBefore=10,
        spaceAfter=7,
    )
    h3 = ParagraphStyle(
        "Heading3Custom",
        parent=base["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#374151"),
        spaceBefore=8,
        spaceAfter=5,
    )
    title = ParagraphStyle(
        "TitleCustom",
        parent=base["Title"],
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=27,
        textColor=colors.HexColor("#111827"),
        spaceAfter=18,
    )
    return {"body": body, "bullet": bullet, "h1": h1, "h2": h2, "h3": h3, "title": title}


def para(text: str, style: ParagraphStyle) -> Paragraph:
    # ReportLab Paragraph parses light HTML; escape accidental angle brackets.
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(text, style)


def write_pdf(book: ExtractedBook, output_pdf: Path) -> None:
    styles = make_styles()
    page_width, page_height = letter
    usable_width = page_width - 1.5 * inch
    usable_height = page_height - 2.1 * inch
    doc = SimpleDocTemplate(
        str(output_pdf),
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        title=book.title,
        author="Codex",
    )

    story = [para(book.title, styles["title"]), Spacer(1, 0.05 * inch)]
    if book.links:
        story.append(para("Source links embedded in the EPUB", styles["h2"]))
        for label, href in book.links:
            story.append(para(f"{label}: {href}", styles["body"]))

    if book.images:
        if book.links or book.sections:
            story.append(PageBreak())
        for idx, (caption, data, (width_px, height_px)) in enumerate(book.images):
            if idx:
                story.append(PageBreak())
            image_aspect = width_px / height_px
            draw_height = usable_height
            draw_width = draw_height * image_aspect
            if draw_width > usable_width:
                draw_width = usable_width
                draw_height = draw_width / image_aspect
            story.append(para(caption, styles["h2"]))
            story.append(Spacer(1, 0.05 * inch))
            story.append(RLImage(BytesIO(data), width=draw_width, height=draw_height))

    first_section = True
    for section in book.sections:
        if book.images or book.links or not first_section:
            story.append(PageBreak())
        first_section = False
        for tag, text in section:
            if tag == "h1":
                style = styles["h1"]
            elif tag == "h2":
                style = styles["h2"]
            elif tag in {"h3", "h4", "h5", "h6"}:
                style = styles["h3"]
            elif tag == "li" or text.startswith("- "):
                style = styles["bullet"]
            else:
                style = styles["body"]
            story.append(para(text, style))
    doc.build(story)


def main() -> int:
    if len(sys.argv) < 4:
        print("Usage: convert_epubs_to_pdfs.py OUT_PDF_DIR OUT_TEXT_DIR EPUB...", file=sys.stderr)
        return 2

    out_pdf_dir = Path(sys.argv[1])
    out_text_dir = Path(sys.argv[2])
    epub_paths = [Path(arg) for arg in sys.argv[3:]]
    out_pdf_dir.mkdir(parents=True, exist_ok=True)
    out_text_dir.mkdir(parents=True, exist_ok=True)

    for epub in epub_paths:
        book = extract_epub(epub)
        name = safe_name(epub)
        pdf_path = out_pdf_dir / f"{name}.pdf"
        text_path = out_text_dir / f"{name}.txt"
        write_pdf(book, pdf_path)
        text_path.write_text("\n".join(book.lines).strip() + "\n", encoding="utf-8")
        print(f"{epub.name} -> {pdf_path} ({len(book.lines)} extracted lines)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
