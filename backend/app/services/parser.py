import fitz  # PyMuPDF
from typing import Union
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract clean raw text from PDF files using PyMuPDF (fitz)
    Returns plain text or raises exception if extraction fails
    """
    try:
        # Open PDF from bytes
        doc = fitz.open(stream=file_content, filetype="pdf")
        text_parts = []

        # Extract text from each page
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            # Get text in reading order (blocks sorted by position)
            blocks = page.get_text("dict")["blocks"]

            # Sort blocks by vertical position (top to bottom), then horizontal (left to right)
            text_blocks = []
            for block in blocks:
                if "lines" in block:  # Text block
                    # Calculate average y0 (top) and x0 (left) for sorting
                    ys = []
                    xs = []
                    for line in block["lines"]:
                        for span in line["spans"]:
                            ys.append(span["bbox"][1])  # y0
                            xs.append(span["bbox"][0])  # x0

                    if ys and xs:
                        avg_y = sum(ys) / len(ys)
                        avg_x = sum(xs) / len(xs)
                        text_blocks.append({
                            "text": " ".join([span["text"] for line in block["lines"] for span in line["spans"]]),
                            "y": avg_y,
                            "x": avg_x
                        })

            # Sort by y then x
            text_blocks.sort(key=lambda b: (b["y"], b["x"]))

            # Extract text in order
            page_text = " ".join([block["text"] for block in text_blocks])
            text_parts.append(page_text)

        doc.close()

        # Join all pages with double newline
        full_text = "\n\n".join(text_parts)

        # Clean up whitespace
        lines = [line.strip() for line in full_text.split("\n") if line.strip()]
        cleaned_text = "\n".join(lines)

        # If we got very little text, it might be a scanned PDF
        if len(cleaned_text.strip()) < 200:
            logger.warning("Extracted text is very short, possibly a scanned PDF")
            # We don't do OCR as it's out of scope, but we return what we have

        return cleaned_text

    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise Exception(f"Failed to parse PDF: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    """
    Extract text from DOCX files
    Fallback implementation - in production would use python-docx
    """
    # For now, we'll treat DOCX as plain text fallback
    # In a real implementation, we'd use python-docx library
    try:
        # Simple UTF-8 decode as fallback
        text = file_content.decode('utf-8', errors='ignore')
        # Clean up basic formatting
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        return "\n".join(lines)
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {str(e)}")
        raise Exception(f"Failed to parse DOCX: {str(e)}")

def parse_resume_file(file_content: bytes, file_extension: str) -> str:
    """
    Main entry point for resume parsing
    Routes to appropriate parser based on file extension
    """
    file_extension = file_extension.lower()

    if file_extension == ".pdf":
        return extract_text_from_pdf(file_content)
    elif file_extension in [".docx", ".doc"]:
        return extract_text_from_docx(file_content)
    else:
        # Fallback: try to decode as UTF-8 text
        try:
            text = file_content.decode('utf-8')
            lines = [line.strip() for line in text.split("\n") if line.strip()]
            return "\n".join(lines)
        except Exception:
            raise Exception(f"Unsupported file type: {file_extension}. Only PDF and DOCX are supported.")

def extract_plain_text(text: str) -> str:
    """
    Extract clean text from raw string input
    Basic cleaning: remove extra whitespace, normalize line endings
    """
    if not text or not text.strip():
        return ""

    # Split into lines, strip each line, filter out empty lines
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # Join with single newline
    cleaned = "\n".join(lines)

    return cleaned