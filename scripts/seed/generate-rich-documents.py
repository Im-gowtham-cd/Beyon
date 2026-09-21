import os
import io
import boto3
from PIL import Image, ImageDraw, ImageFont

def get_font(size, bold=False):
    try:
        font_name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(font_name, size)
    except Exception:
        return ImageFont.load_default()

def generate_internship_certificate() -> bytes:
    width, height = 1400, 950
    img = Image.new("RGB", (width, height), color="#FDFBF7")
    draw = ImageDraw.Draw(img)

    # Outer decorative borders
    draw.rectangle([25, 25, width - 25, height - 25], outline="#1C2D81", width=14)
    draw.rectangle([45, 45, width - 45, height - 45], outline="#FED601", width=5)
    draw.rectangle([55, 55, width - 55, height - 55], outline="#CBD5E1", width=1)

    # Top Header
    f_h1 = get_font(22, bold=True)
    f_sub = get_font(13, bold=True)
    draw.text((width // 2, 95), "BEYON ACCREDITED ENTERPRISE VERIFICATION NETWORK", fill="#1C2D81", font=f_h1, anchor="mm")
    draw.text((width // 2, 130), "OFFICIAL INSTITUTIONAL & RECRUITER VERIFIED CREDENTIAL", fill="#64748B", font=f_sub, anchor="mm")

    # Certificate Title
    f_title = get_font(46, bold=True)
    draw.text((width // 2, 210), "CERTIFICATE OF INTERNSHIP", fill="#1C2D81", font=f_title, anchor="mm")

    f_p = get_font(19, bold=False)
    draw.text((width // 2, 270), "This is proudly presented to certify that", fill="#475569", font=f_p, anchor="mm")

    # Student Name
    f_name = get_font(42, bold=True)
    draw.text((width // 2, 335), "GOWTHAM C D", fill="#0F172A", font=f_name, anchor="mm")
    draw.line([(width // 2 - 220, 365), (width // 2 + 220, 365)], fill="#1C2D81", width=3)

    # Program Text
    f_body = get_font(19, bold=False)
    draw.text((width // 2, 420), "has successfully completed the 8-Week Professional Internship in", fill="#334155", font=f_body, anchor="mm")

    f_role = get_font(26, bold=True)
    draw.text((width // 2, 465), "Cloud Systems & Microservices Engineering", fill="#1C2D81", font=f_role, anchor="mm")

    draw.text((width // 2, 515), "Conducted at Atlassian Software Systems in partnership with Kongu Engineering College.", fill="#475569", font=f_body, anchor="mm")
    draw.text((width // 2, 550), "Performance Evaluation: Grade A+ (Outstanding Architecture & Production Reliability).", fill="#15803D", font=get_font(17, bold=True), anchor="mm")

    # Gold Stamp / Seal
    seal_x, seal_y = width // 2, 660
    draw.ellipse([seal_x - 55, seal_y - 55, seal_x + 55, seal_y + 55], fill="#FED601", outline="#1C2D81", width=4)
    draw.text((seal_x, seal_y - 12), "★ VERIFIED ★", fill="#1C2D81", font=get_font(12, bold=True), anchor="mm")
    draw.text((seal_x, seal_y + 10), "2026", fill="#1C2D81", font=get_font(15, bold=True), anchor="mm")

    # Signatures
    f_sig = get_font(24, bold=True)
    f_desig = get_font(13, bold=False)

    # Left signature
    draw.line([(150, 770), (450, 770)], fill="#94A3B8", width=2)
    draw.text((300, 745), "Dr. R. Sengottuvelu", fill="#0F172A", font=f_sig, anchor="mm")
    draw.text((300, 790), "Dean & Placement Cell Incharge, KEC", fill="#64748B", font=f_desig, anchor="mm")

    # Right signature
    draw.line([(width - 450, 770), (width - 150, 770)], fill="#94A3B8", width=2)
    draw.text((width - 300, 745), "David K. Harrison", fill="#0F172A", font=f_sig, anchor="mm")
    draw.text((width - 300, 790), "VP, Global Engineering Operations", fill="#64748B", font=f_desig, anchor="mm")

    # Footer verification line
    f_foot = get_font(12, bold=False)
    draw.text((width // 2, 890), "BYN-INT-2026-9812 | SHA256: 8F3D1A9B...44E0 | ISSUED: 2026-06-15 | VALIDATED", fill="#94A3B8", font=f_foot, anchor="mm")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def generate_student_id_card() -> bytes:
    width, height = 1000, 620
    img = Image.new("RGB", (width, height), color="#F8FAFC")
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rounded_rectangle([15, 15, width - 15, height - 15], radius=24, outline="#CBD5E1", width=4)

    # Header
    draw.rounded_rectangle([18, 18, width - 18, 130], radius=22, fill="#1C2D81")
    draw.rectangle([18, 90, width - 18, 130], fill="#1C2D81")
    draw.rectangle([18, 130, width - 18, 138], fill="#FED601")

    f_inst = get_font(26, bold=True)
    draw.text((width // 2, 55), "KONGU ENGINEERING COLLEGE", fill="#FFFFFF", font=f_inst, anchor="mm")
    draw.text((width // 2, 88), "Autonomous Institution | Accredited 'A++' Grade by NAAC | Perundurai, Erode", fill="#E2E8F0", font=get_font(13, bold=False), anchor="mm")
    draw.text((width // 2, 114), "STUDENT IDENTITY CARD (ACADEMIC YEAR 2023 - 2027)", fill="#FED601", font=get_font(12, bold=True), anchor="mm")

    # Photo placeholder box
    px, py, pw, ph = 70, 180, 190, 230
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=12, fill="#E2E8F0", outline="#94A3B8", width=2)
    draw.ellipse([px + 55, py + 40, px + 135, py + 120], fill="#CBD5E1")
    draw.chord([px + 30, py + 120, px + 160, py + 230], start=0, end=180, fill="#CBD5E1")
    draw.text((px + pw // 2, py + 205), "STUDENT PHOTO", fill="#64748B", font=get_font(11, bold=True), anchor="mm")

    # Details
    tx = 300
    draw.text((tx, 205), "GOWTHAM C D", fill="#1C2D81", font=get_font(28, bold=True))

    draw.text((tx, 255), "ROLL NO:", fill="#64748B", font=get_font(14, bold=True))
    draw.text((tx + 140, 255), "23CS142", fill="#0F172A", font=get_font(17, bold=True))

    draw.text((tx, 295), "DEPARTMENT:", fill="#64748B", font=get_font(14, bold=True))
    draw.text((tx + 140, 295), "Computer Science & Engineering", fill="#0F172A", font=get_font(16, bold=False))

    draw.text((tx, 335), "DEGREE:", fill="#64748B", font=get_font(14, bold=True))
    draw.text((tx + 140, 335), "B.E. Computer Science & Engineering", fill="#0F172A", font=get_font(16, bold=False))

    draw.text((tx, 375), "VALID TILL:", fill="#64748B", font=get_font(14, bold=True))
    draw.text((tx + 140, 375), "MAY 2027 (VERIFIED ACTIVE)", fill="#15803D", font=get_font(16, bold=True))

    # Barcode
    bx, by = 70, 445
    for i in range(50):
        bw = 4 if i % 3 == 0 or i % 7 == 0 else 2
        draw.rectangle([bx + (i * 14), by, bx + (i * 14) + bw, by + 45], fill="#0F172A")
    draw.text((bx + 350, by + 58), "* KEC-23CS142-2026-AUT *", fill="#64748B", font=get_font(11, bold=False), anchor="mm")

    # Principal Signature
    draw.text((width - 240, 520), "Dr. S. Balasubramanian", fill="#1C2D81", font=get_font(16, bold=True), anchor="mm")
    draw.text((width - 240, 545), "Principal & Chief Superintendent", fill="#64748B", font=get_font(12, bold=False), anchor="mm")

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()

def generate_pdf_resume() -> bytes:
    pdf = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >> endobj
4 0 obj << /Length 750 >> stream
BT
/F1 22 Tf 50 730 Td (GOWTHAM C D) Tj
/F2 10 Tf 0 -18 Td (Email: gowthamcd@example.com | Mobile: +91 98765 43210 | GitHub: github.com/gowtham-cd) Tj
/F1 13 Tf 0 -30 Td (PROFESSIONAL SUMMARY) Tj
/F2 10 Tf 0 -15 Td (Full-Stack Software Engineer with verified competence in Java, Spring Boot, React, and TypeScript.) Tj
0 -14 Td (Demonstrated mastery in cloud architectures, microservices optimization, and distributed databases.) Tj
/F1 13 Tf 0 -26 Td (EDUCATION & ACADEMIC ACHIEVEMENTS) Tj
/F1 10 Tf 0 -15 Td (Kongu Engineering College - B.E. Computer Science & Engineering) Tj
/F2 10 Tf 0 -14 Td (Cumulative CGPA: 8.65 / 10.0 | Graduation Year: 2027) Tj
/F1 13 Tf 0 -26 Td (TECHNICAL SKILLS & TAXONOMY) Tj
/F2 10 Tf 0 -15 Td (Languages: Java, TypeScript, JavaScript, Python, SQL) Tj
0 -14 Td (Frameworks & Tools: Spring Boot 3, React 19, Vite, PostgreSQL, Redis, Docker, AWS S3) Tj
/F1 13 Tf 0 -26 Td (VERIFIED INTERNSHIPS & EXPERIENCE) Tj
/F1 10 Tf 0 -15 Td (Atlassian Software Systems - Systems Engineering Intern) Tj
/F2 10 Tf 0 -14 Td (Implemented event-driven telemetry and microservice caching layer reducing latency by 35%.) Tj
/F1 13 Tf 0 -26 Td (BEYON VERIFICATION METADATA) Tj
/F2 9 Tf 0 -14 Td (Cryptographic Verification Hash: 9f8a7b6c5d4e3f2a1b0c | Verified by Institution Placement Cell) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000001048 00000 n 
0000001128 00000 n 
trailer << /Size 7 /Root 1 0 R >>
startxref
1203
%%EOF"""
    return pdf

def main():
    s3 = boto3.client(
        's3',
        endpoint_url='http://localhost:4566',
        aws_access_key_id='test',
        aws_secret_access_key='test',
        region_name='us-east-1'
    )
    bucket = 'beyon-documents'

    docs = [
        ('INTERNSHIP_CERTIFICATE/d919f195_4.png', generate_internship_certificate(), 'image/png'),
        ('STUDENT_ID_CARD/15fe2266_IMG20260912150510.jpg', generate_student_id_card(), 'image/jpeg'),
        ('RESUME/08dc1da1_GOWTHAM_C_D.pdf', generate_pdf_resume(), 'application/pdf'),
        ('ACADEMIC_RECORD/10th_marksheet_gowtham.pdf', generate_pdf_resume(), 'application/pdf'),
        ('ACADEMIC_RECORD/12th_gradecard_gowtham.pdf', generate_pdf_resume(), 'application/pdf'),
    ]

    target_dirs = [
        os.path.join(os.getcwd(), 'uploads', 'documents'),
        os.path.join(os.getcwd(), 'backend', 'uploads', 'documents'),
    ]

    for rel_path, data, mime in docs:
        # 1. Save to local disk
        for base in target_dirs:
            full_path = os.path.join(base, rel_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'wb') as f:
                f.write(data)
            print(f"Saved to disk: {full_path} ({len(data)} bytes)")

        # 2. Upload to S3 Floci
        s3_key_1 = f"documents/{rel_path}"
        s3_key_2 = rel_path
        try:
            s3.put_object(Bucket=bucket, Key=s3_key_1, Body=data, ContentType=mime)
            s3.put_object(Bucket=bucket, Key=s3_key_2, Body=data, ContentType=mime)
            print(f"Uploaded to S3: s3://{bucket}/{s3_key_1}")
        except Exception as e:
            print(f"S3 upload notice: {e}")

    print("All rich mock documents successfully generated and synced!")

if __name__ == '__main__':
    main()
