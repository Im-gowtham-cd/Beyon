import sys
import os
import json
import time
import uuid
import pymupdf

def clean_str(val):
    if val is None:
        return ""
    return " ".join(str(val).replace("\n", " ").split()).strip()

def extract_aicte_data():
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dataset/aicte.pdf"))
    out_json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dataset/aicte_institutions.json"))
    out_sql_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dataset/aicte_institutions_seed.sql"))

    if not os.path.exists(pdf_path):
        print(f"[ERROR] PDF not found at {pdf_path}", flush=True)
        return

    print(f"[INFO] Opening AICTE PDF: {pdf_path}", flush=True)
    t0 = time.time()
    doc = pymupdf.open(pdf_path)
    total_pages = len(doc)
    print(f"[INFO] Document loaded. Total pages: {total_pages}", flush=True)

    institutions = []
    seen_ids = set()

    for page_idx in range(total_pages):
        page = doc[page_idx]
        tabs = page.find_tables()
        for tab in tabs.tables:
            rows = tab.extract()
            for r in rows:
                if not r or len(r) < 8:
                    continue
                
                sr_no = clean_str(r[0])
                aicte_id = clean_str(r[1])
                inst_name = clean_str(r[2])
                region = clean_str(r[3])
                state = clean_str(r[4])
                district = clean_str(r[5])
                city = clean_str(r[6])
                user_group = clean_str(r[7])

                # Skip header rows
                if not aicte_id or "AICTE" in aicte_id or "Permanent" in aicte_id:
                    continue
                # Ensure it looks like an AICTE ID (e.g. 1-...)
                if not aicte_id.startswith("1-"):
                    continue

                if aicte_id in seen_ids:
                    continue

                seen_ids.add(aicte_id)
                institutions.append({
                    "aicte_id": aicte_id,
                    "institute_name": inst_name,
                    "region": region,
                    "state": state,
                    "district": district,
                    "city": city,
                    "user_group": user_group
                })

        if (page_idx + 1) % 25 == 0 or page_idx == total_pages - 1:
            print(f"[PROGRESS] Processed {page_idx + 1}/{total_pages} pages, extracted {len(institutions)} institutions so far...", flush=True)

    elapsed = time.time() - t0
    print(f"[SUCCESS] Extraction complete in {elapsed:.2f}s. Total unique institutions: {len(institutions)}", flush=True)

    # Save to JSON
    print(f"[INFO] Saving JSON to {out_json_path}...", flush=True)
    with open(out_json_path, "w", encoding="utf-8") as f:
        json.dump(institutions, f, indent=2, ensure_ascii=False)
    print(f"[SUCCESS] Saved {len(institutions)} records to {out_json_path}", flush=True)

    # Also save a minified version in web/src/data for client-side search
    web_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../web/src/data"))
    os.makedirs(web_data_dir, exist_ok=True)
    web_json_path = os.path.join(web_data_dir, "aicte_institutions.json")
    print(f"[INFO] Saving client lookup copy to {web_json_path}...", flush=True)
    with open(web_json_path, "w", encoding="utf-8") as f:
        json.dump(institutions, f, separators=(",", ":"), ensure_ascii=False)

    # Generate SQL seed file
    print(f"[INFO] Generating SQL seed file at {out_sql_path}...", flush=True)
    with open(out_sql_path, "w", encoding="utf-8") as f:
        f.write("-- AICTE Institutions Seed Data\n")
        f.write("USE beyon;\n\n")
        
        # Batch into INSERT statements of 100 records
        batch_size = 100
        for i in range(0, len(institutions), batch_size):
            batch = institutions[i:i+batch_size]
            values_list = []
            for item in batch:
                record_id = str(uuid.uuid4())
                aicte_id_esc = item["aicte_id"].replace("'", "''")
                name_esc = item["institute_name"].replace("'", "''")
                region_esc = item["region"].replace("'", "''")
                state_esc = item["state"].replace("'", "''")
                dist_esc = item["district"].replace("'", "''")
                city_esc = item["city"].replace("'", "''")
                group_esc = item["user_group"].replace("'", "''")
                values_list.append(
                    f"('{record_id}', '{aicte_id_esc}', '{name_esc}', '{region_esc}', '{state_esc}', '{dist_esc}', '{city_esc}', '{group_esc}')"
                )
            stmt = f"INSERT IGNORE INTO aicte_institutions (id, aicte_id, institute_name, region, state, district, city, user_group) VALUES\n" + ",\n".join(values_list) + ";\n"
            f.write(stmt)

    print(f"[SUCCESS] SQL seed file generated at {out_sql_path}", flush=True)

if __name__ == "__main__":
    extract_aicte_data()
