"""
Google ADK Tools
Provides google_search and related agent tooling for web exploration and grounding.
"""

from typing import List, Dict, Any, Optional
import urllib.parse
import re
import httpx
import json


def google_search(query: str, num_results: int = 5, site_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Search the web using Google Search / authoritative educational search engines.
    
    Args:
        query: The search query string (e.g., 'Kongunadu College of Engineering and Technology Trichy').
        num_results: Maximum number of search results to return.
        site_filter: Optional domain constraint (e.g., 'aicte-india.org').
        
    Returns:
        List of result items with 'title', 'url', 'snippet', and 'source_domain'.
    """
    full_query = query
    if site_filter:
        full_query = f"{query} site:{site_filter}"

    results: List[Dict[str, Any]] = []
    seen_urls = set()

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    # Strategy 1: Search via DuckDuckGo HTML (Real-time organic educational results & official portals)
    try:
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote_plus(full_query)}"
        with httpx.Client(timeout=6.0, follow_redirects=True, headers=headers) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                html = resp.text
                matches = re.findall(
                    r'<h2 class="result__title">\s*<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>\s*</h2>.*?<a class="result__snippet[^"]*"[^>]*>(.*?)</a>',
                    html,
                    re.DOTALL | re.IGNORECASE
                )
                for raw_url, raw_title, raw_snippet in matches:
                    clean_url = raw_url.strip()
                    if "uddg=" in clean_url:
                        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(clean_url).query)
                        if "uddg" in parsed:
                            clean_url = parsed["uddg"][0]

                    clean_title = re.sub(r'<[^>]+>', '', raw_title).strip()
                    clean_snippet = re.sub(r'<[^>]+>', '', raw_snippet).strip()
                    domain = urllib.parse.urlparse(clean_url).netloc.lower()

                    if clean_url and clean_url not in seen_urls and "duckduckgo.com" not in domain:
                        seen_urls.add(clean_url)
                        results.append({
                            "title": clean_title or domain,
                            "url": clean_url,
                            "snippet": clean_snippet,
                            "source_domain": domain,
                        })
                        if len(results) >= num_results:
                            break
    except Exception:
        pass

    # Strategy 2: Instant Answer Knowledge API
    if len(results) < num_results:
        try:
            api_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote_plus(full_query)}&format=json&no_html=1"
            with httpx.Client(timeout=4.0) as client:
                resp = client.get(api_url)
                if resp.status_code in (200, 202):
                    data = resp.json()
                    official_site = data.get("OfficialWebsite")
                    if official_site and official_site not in seen_urls:
                        seen_urls.add(official_site)
                        results.append({
                            "title": f"Official Portal - {data.get('Heading', full_query)}",
                            "url": official_site,
                            "snippet": f"Official Website: {official_site} ({data.get('OfficialDomain', '')})",
                            "source_domain": urllib.parse.urlparse(official_site).netloc,
                        })
                    ab_url = data.get("AbstractURL")
                    ab_txt = data.get("Abstract")
                    if ab_url and ab_txt and ab_url not in seen_urls:
                        seen_urls.add(ab_url)
                        results.append({
                            "title": data.get("Heading") or full_query,
                            "url": ab_url,
                            "snippet": ab_txt,
                            "source_domain": urllib.parse.urlparse(ab_url).netloc,
                        })
        except Exception:
            pass

    return results[:num_results]
