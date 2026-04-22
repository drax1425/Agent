"""
Security tools available to the CyberSec Professor agent.
Each function is called by the agent when it needs to provide
structured, reliable information to the user.
"""

from __future__ import annotations

OWASP_TOP_10_2021 = {
    "A01": {
        "name": "Broken Access Control",
        "description": (
            "Restrictions on what authenticated users are allowed to do are often "
            "not properly enforced. Attackers can exploit these flaws to access "
            "unauthorized functionality or data."
        ),
        "examples": [
            "Accessing another user's account by modifying a URL parameter",
            "Bypassing access control checks by modifying cookies or hidden fields",
            "Privilege escalation (acting as admin without being logged in as admin)",
            "IDOR (Insecure Direct Object Reference)",
        ],
        "mitigations": [
            "Deny by default; only grant access to resources that are explicitly allowed",
            "Implement server-side access control — never rely on client-side checks",
            "Log access control failures and alert on repeated failures",
            "Invalidate stateful session tokens after logout",
        ],
    },
    "A02": {
        "name": "Cryptographic Failures",
        "description": (
            "Failures related to cryptography (or lack of it) that often lead to "
            "exposure of sensitive data. Formerly known as 'Sensitive Data Exposure'."
        ),
        "examples": [
            "Transmitting data in cleartext (HTTP, SMTP, FTP)",
            "Using weak/deprecated algorithms like MD5, SHA1, DES",
            "Hard-coded cryptographic keys in source code",
            "Not enforcing TLS or accepting invalid certificates",
        ],
        "mitigations": [
            "Classify data processed and apply controls per classification",
            "Use strong, up-to-date algorithms (AES-256, SHA-256+)",
            "Enforce HTTPS with HSTS; use secure cookies",
            "Store passwords with bcrypt, scrypt, or Argon2",
        ],
    },
    "A03": {
        "name": "Injection",
        "description": (
            "User-supplied data is not validated, filtered, or sanitized. "
            "This includes SQL, NoSQL, OS command, LDAP, XPath injections."
        ),
        "examples": [
            "SQL injection: ' OR '1'='1",
            "Command injection: ; ls -la",
            "LDAP injection via unsanitized authentication fields",
            "XPath injection in XML-based authentication",
        ],
        "mitigations": [
            "Use parameterized queries / prepared statements",
            "Use an ORM that handles escaping",
            "Validate, filter, and sanitize all user input server-side",
            "Least privilege: DB accounts should have minimal permissions",
        ],
    },
    "A04": {
        "name": "Insecure Design",
        "description": (
            "Risks related to design and architectural flaws. Missing or ineffective "
            "control design — not just bad implementation."
        ),
        "examples": [
            "Password recovery that reveals security questions",
            "No rate limiting on authentication endpoints",
            "Storing sensitive data without a business need",
        ],
        "mitigations": [
            "Use threat modeling during design phase",
            "Integrate security requirements into user stories",
            "Write unit and integration tests for critical security controls",
        ],
    },
    "A05": {
        "name": "Security Misconfiguration",
        "description": (
            "Improperly configured permissions, unnecessary features enabled, "
            "default accounts/passwords, overly informative error messages."
        ),
        "examples": [
            "Default credentials unchanged (admin/admin)",
            "Directory listing enabled on web server",
            "Detailed stack traces exposed to end users",
            "Unnecessary HTTP methods enabled (PUT, DELETE, TRACE)",
        ],
        "mitigations": [
            "Repeatable hardening process for all environments",
            "Minimal platform: remove unused features, frameworks, components",
            "Review and update configurations as part of patch management",
        ],
    },
    "A06": {
        "name": "Vulnerable and Outdated Components",
        "description": (
            "Using components with known vulnerabilities such as libraries, "
            "frameworks, and other software modules."
        ),
        "examples": [
            "Using an outdated version of Apache Struts (CVE-2017-5638)",
            "Unpatched CMS with known exploits",
            "Dependencies with transitive vulnerable sub-dependencies",
        ],
        "mitigations": [
            "Continuously inventory versions of components",
            "Subscribe to security bulletins for your dependencies",
            "Use SCA tools (OWASP Dependency-Check, Snyk, Dependabot)",
        ],
    },
    "A07": {
        "name": "Identification and Authentication Failures",
        "description": (
            "Weaknesses in authentication and session management allowing attackers "
            "to assume users' identities."
        ),
        "examples": [
            "Weak passwords allowed (e.g., '123456')",
            "Credential stuffing / brute force not mitigated",
            "Session IDs exposed in URLs",
            "Session not invalidated after logout",
        ],
        "mitigations": [
            "Implement MFA",
            "Enforce strong password policies; check against breached-password lists",
            "Limit failed login attempts with account lockout or CAPTCHA",
            "Use secure, server-side session management",
        ],
    },
    "A08": {
        "name": "Software and Data Integrity Failures",
        "description": (
            "Code and infrastructure that does not protect against integrity violations. "
            "Includes insecure deserialization and CI/CD pipeline attacks."
        ),
        "examples": [
            "Application that deserializes untrusted objects",
            "Auto-update without integrity verification",
            "Malicious npm/PyPI packages in supply chain",
        ],
        "mitigations": [
            "Use digital signatures to verify software integrity",
            "Ensure dependencies come from trusted repositories",
            "Review code changes and configuration for security impact",
        ],
    },
    "A09": {
        "name": "Security Logging and Monitoring Failures",
        "description": (
            "Insufficient logging, monitoring, and response. Without visibility, "
            "breaches cannot be detected or responded to."
        ),
        "examples": [
            "Login failures not logged",
            "No alerting on suspicious activity (port scans, brute force)",
            "Logs stored locally only (destroyed in breach)",
        ],
        "mitigations": [
            "Log authentication events, access control failures, and input validation errors",
            "Ensure logs have enough context for forensic analysis",
            "Establish an incident response plan",
        ],
    },
    "A10": {
        "name": "Server-Side Request Forgery (SSRF)",
        "description": (
            "SSRF flaws occur when a web application fetches a remote resource "
            "without validating the user-supplied URL."
        ),
        "examples": [
            "Fetching internal metadata endpoints (AWS: 169.254.169.254)",
            "Scanning internal network via vulnerable webhook feature",
            "Accessing internal services not exposed to the internet",
        ],
        "mitigations": [
            "Sanitize and validate all client-supplied input URLs",
            "Use a allowlist of allowed domains/IPs for outbound requests",
            "Disable HTTP redirections",
            "Segment remote resource access functionality in a separate network",
        ],
    },
}

VULNERABILITY_DATABASE: dict[str, dict] = {
    "xss": {
        "full_name": "Cross-Site Scripting (XSS)",
        "types": ["Reflected", "Stored", "DOM-based"],
        "description": (
            "XSS allows attackers to inject client-side scripts into web pages viewed "
            "by other users. It can be used to steal session cookies, deface websites, "
            "redirect users, or install keyloggers."
        ),
        "payload_examples": [
            "<script>alert(1)</script>",
            "<img src=x onerror=alert(document.cookie)>",
            "javascript:alert(1)",
            "'><svg/onload=alert(1)>",
        ],
        "detection": [
            "Inject payloads in all input fields, URL parameters, headers",
            "Use tools: Burp Suite Active Scanner, OWASP ZAP, XSStrike",
            "Check if input is reflected without encoding in response",
        ],
        "prevention": [
            "Output encode all user-supplied data (HTML, JS, CSS, URL context)",
            "Content Security Policy (CSP) header",
            "Use a modern framework with built-in XSS protection",
            "HttpOnly and Secure cookie flags",
        ],
    },
    "sqli": {
        "full_name": "SQL Injection",
        "types": ["Classic / Error-based", "Blind (Boolean / Time-based)", "Union-based", "Out-of-band"],
        "description": (
            "SQL injection occurs when user input is incorrectly filtered and incorporated "
            "into SQL queries. Attackers can read/modify database data, execute admin operations, "
            "or in some DBMSs, issue OS commands."
        ),
        "payload_examples": [
            "' OR '1'='1' --",
            "' UNION SELECT null, username, password FROM users --",
            "'; WAITFOR DELAY '0:0:5' --  (time-based blind)",
            "1' AND SLEEP(5) --",
        ],
        "detection": [
            "Send single quote (') and observe errors",
            "Boolean-based: AND 1=1 vs AND 1=2",
            "Tools: sqlmap, Burp Suite",
        ],
        "prevention": [
            "Parameterized queries / prepared statements",
            "Stored procedures (with care)",
            "ORM with parameterization",
            "WAF as defense-in-depth",
        ],
    },
    "csrf": {
        "full_name": "Cross-Site Request Forgery (CSRF)",
        "types": ["GET-based", "POST-based", "Login CSRF"],
        "description": (
            "CSRF tricks authenticated users into submitting requests they did not intend. "
            "Exploits the trust a website has in the user's browser."
        ),
        "payload_examples": [
            '<img src="https://bank.com/transfer?to=attacker&amount=1000">',
            '<form action="https://target.com/change-email" method="POST">...',
        ],
        "detection": [
            "Check if state-changing requests have CSRF tokens",
            "Test if SameSite cookie attribute is set",
            "Check if Origin/Referer headers are validated",
        ],
        "prevention": [
            "CSRF tokens (synchronizer token pattern)",
            "SameSite=Strict or SameSite=Lax cookie attribute",
            "Check Origin/Referer headers on state-changing requests",
            "Double-submit cookie pattern",
        ],
    },
    "idor": {
        "full_name": "Insecure Direct Object Reference (IDOR)",
        "types": ["URL parameter", "Body parameter", "Cookie value", "Header value"],
        "description": (
            "IDOR occurs when an application uses user-controllable input to access objects "
            "directly without authorization checks."
        ),
        "payload_examples": [
            "/api/users/1337/profile  -> change 1337 to another user's ID",
            "/download?file=invoice_001.pdf -> change to invoice_002.pdf",
        ],
        "detection": [
            "Enumerate numeric IDs (1, 2, 3...)",
            "Try GUIDs of other users (if obtainable)",
            "Test horizontal and vertical privilege escalation",
        ],
        "prevention": [
            "Always verify user is authorized to access requested object",
            "Use indirect reference maps (randomize IDs per session)",
            "Audit all object reference access server-side",
        ],
    },
    "ssrf": {
        "full_name": "Server-Side Request Forgery (SSRF)",
        "types": ["Basic SSRF", "Blind SSRF"],
        "description": (
            "SSRF allows attackers to make the server perform requests on their behalf. "
            "This can expose internal services, cloud metadata, or facilitate RCE."
        ),
        "payload_examples": [
            "http://169.254.169.254/latest/meta-data/  (AWS metadata)",
            "http://localhost:6379/  (Redis)",
            "file:///etc/passwd",
            "http://0.0.0.0:8080/admin",
        ],
        "detection": [
            "Find any URL input (webhooks, URL preview, fetch features)",
            "Use Burp Collaborator or interactsh for blind SSRF",
            "Try internal IP ranges: 127.0.0.1, 10.x.x.x, 172.16.x.x, 192.168.x.x",
        ],
        "prevention": [
            "Allowlist of allowed URLs/IPs",
            "Disable HTTP redirects",
            "Resolve DNS and validate resolved IP against allowlist",
            "Segment internal network; require authentication on internal services",
        ],
    },
    "lfi": {
        "full_name": "Local File Inclusion (LFI)",
        "types": ["Basic LFI", "LFI to RCE (log poisoning, PHP wrappers)"],
        "description": (
            "LFI allows attackers to include files from the server's filesystem "
            "in the application's response. Can escalate to RCE."
        ),
        "payload_examples": [
            "../../etc/passwd",
            "....//....//etc/passwd  (filter bypass)",
            "php://filter/convert.base64-encode/resource=index.php",
            "/var/log/apache2/access.log  (log poisoning for RCE)",
        ],
        "detection": [
            "Test file path parameters with ../",
            "Check for error messages revealing file paths",
            "Try null byte: ../../etc/passwd%00 (older PHP)",
        ],
        "prevention": [
            "Avoid passing user input to file system functions",
            "Use a allowlist of allowed file paths",
            "Chroot/jail web server process",
            "Disable dangerous PHP functions (allow_url_include)",
        ],
    },
    "xxe": {
        "full_name": "XML External Entity (XXE)",
        "types": ["Classic XXE", "Blind XXE", "XXE via SVG/DOCX upload"],
        "description": (
            "XXE exploits XML parsers that process external entity references. "
            "Can be used to read local files, SSRF, or DoS."
        ),
        "payload_examples": [
            '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
            '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://attacker.com/">]>',
        ],
        "detection": [
            "Inject XXE payloads into XML input fields, file uploads, SOAP endpoints",
            "Use out-of-band (OOB) techniques for blind XXE (Burp Collaborator)",
        ],
        "prevention": [
            "Disable external entity processing in XML parser",
            "Use less complex data formats (JSON)",
            "Patch/upgrade XML processing libraries",
            "SAST tools to detect vulnerable XML parsers",
        ],
    },
}

PENTEST_METHODOLOGIES = {
    "web": {
        "phases": [
            {
                "name": "Reconnaissance",
                "description": "Passive and active information gathering",
                "tasks": [
                    "WHOIS, DNS enumeration (subdomains, MX, TXT records)",
                    "Technology fingerprinting (Wappalyzer, whatweb)",
                    "Google dorking (site:, filetype:, inurl:)",
                    "Shodan/Censys for exposed services",
                    "Web archive analysis (Wayback Machine)",
                    "Certificate transparency logs (crt.sh)",
                ],
            },
            {
                "name": "Scanning & Enumeration",
                "description": "Active probing of the target",
                "tasks": [
                    "Port scan (nmap -sV -sC target)",
                    "Directory/file bruteforce (gobuster, ffuf, dirsearch)",
                    "Parameter discovery (Arjun, ParamSpider)",
                    "API endpoint enumeration",
                    "CMS detection and version enumeration (WPScan, droopescan)",
                ],
            },
            {
                "name": "Vulnerability Analysis",
                "description": "Identify exploitable weaknesses",
                "tasks": [
                    "Manual testing based on OWASP Top 10",
                    "Automated scanning (Burp Suite, OWASP ZAP, Nikto)",
                    "Check for known CVEs in identified components",
                    "Authentication and authorization testing",
                    "Business logic testing",
                ],
            },
            {
                "name": "Exploitation",
                "description": "Attempt to exploit confirmed vulnerabilities (authorized only)",
                "tasks": [
                    "Exploit SQLi with sqlmap",
                    "XSS to session hijack",
                    "SSRF to internal service access",
                    "File upload bypass to webshell",
                    "IDOR for unauthorized data access",
                ],
            },
            {
                "name": "Post-Exploitation",
                "description": "Demonstrate business impact",
                "tasks": [
                    "Data exfiltration proof of concept",
                    "Lateral movement assessment",
                    "Privilege escalation documentation",
                    "Persistence mechanisms (for red team)",
                ],
            },
            {
                "name": "Reporting",
                "description": "Document findings professionally",
                "tasks": [
                    "Executive summary (non-technical)",
                    "Technical findings with CVSS scores",
                    "Evidence (screenshots, request/response)",
                    "Remediation recommendations (short-term & long-term)",
                    "Risk rating per finding",
                ],
            },
        ]
    },
    "network": {
        "phases": [
            {
                "name": "Reconnaissance",
                "tasks": [
                    "OSINT: ASN, IP ranges, BGP routes",
                    "Passive DNS analysis",
                ],
            },
            {
                "name": "Scanning",
                "tasks": [
                    "Host discovery: nmap -sn 192.168.1.0/24",
                    "Port scan: nmap -p- -T4 target",
                    "Service/version detection: nmap -sV -sC",
                    "OS fingerprinting: nmap -O",
                    "Vulnerability scan: nmap --script vuln / Nessus / OpenVAS",
                ],
            },
            {
                "name": "Exploitation",
                "tasks": [
                    "Metasploit for known CVEs",
                    "Default credential testing",
                    "Protocol-specific attacks (SMB, FTP, SSH brute force)",
                ],
            },
        ]
    },
}

TOOLS_BY_CATEGORY = {
    "reconnaissance": [
        {"name": "nmap", "use": "Port scanning and service enumeration", "example": "nmap -sV -sC -p- target.com"},
        {"name": "theHarvester", "use": "Email, subdomain, IP OSINT", "example": "theHarvester -d target.com -b all"},
        {"name": "amass", "use": "Subdomain enumeration", "example": "amass enum -d target.com"},
        {"name": "subfinder", "use": "Fast passive subdomain discovery", "example": "subfinder -d target.com"},
        {"name": "shodan", "use": "Search engine for internet-connected devices", "example": "shodan search hostname:target.com"},
        {"name": "whois", "use": "Domain registration information", "example": "whois target.com"},
    ],
    "web": [
        {"name": "Burp Suite", "use": "Web application security testing proxy", "example": "Intercept and modify HTTP(S) traffic"},
        {"name": "OWASP ZAP", "use": "Free web app scanner and proxy", "example": "zap-cli quick-scan --self-contained -t http://target.com"},
        {"name": "gobuster", "use": "Directory/file/DNS brute forcer", "example": "gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt"},
        {"name": "ffuf", "use": "Fast web fuzzer", "example": "ffuf -u http://target.com/FUZZ -w wordlist.txt"},
        {"name": "nikto", "use": "Web server scanner", "example": "nikto -h http://target.com"},
        {"name": "sqlmap", "use": "Automatic SQL injection detection and exploitation", "example": "sqlmap -u 'http://target.com/page?id=1' --dbs"},
        {"name": "XSStrike", "use": "Advanced XSS detection suite", "example": "python3 xsstrike.py -u 'http://target.com/search?q=test'"},
        {"name": "WPScan", "use": "WordPress vulnerability scanner", "example": "wpscan --url http://target.com --enumerate p,u"},
    ],
    "exploitation": [
        {"name": "Metasploit", "use": "Penetration testing framework", "example": "msfconsole -> use exploit/... -> set RHOSTS target"},
        {"name": "searchsploit", "use": "Search Exploit-DB offline", "example": "searchsploit apache 2.4"},
        {"name": "hydra", "use": "Network login brute-forcer", "example": "hydra -l admin -P rockyou.txt ssh://target.com"},
    ],
    "analysis": [
        {"name": "Wireshark", "use": "Network packet analyzer", "example": "Capture and analyze network traffic"},
        {"name": "strings", "use": "Extract strings from binaries", "example": "strings binary_file | grep -i password"},
        {"name": "Ghidra", "use": "Reverse engineering framework (NSA)", "example": "Decompile and analyze binaries"},
        {"name": "binwalk", "use": "Firmware analysis and extraction", "example": "binwalk -e firmware.bin"},
        {"name": "john", "use": "Password cracker", "example": "john hash.txt --wordlist=rockyou.txt"},
        {"name": "hashcat", "use": "GPU-accelerated password cracker", "example": "hashcat -m 0 hash.txt rockyou.txt"},
    ],
    "post_exploitation": [
        {"name": "LinPEAS/WinPEAS", "use": "Privilege escalation enumeration scripts", "example": "curl -L https://github.com/.../linpeas.sh | sh"},
        {"name": "GTFOBins", "use": "Unix binaries for privilege escalation", "example": "Check https://gtfobins.github.io/"},
        {"name": "LOLBAS", "use": "Living off the land binaries (Windows)", "example": "Check https://lolbas-project.github.io/"},
    ],
}


def get_owasp_info(category_id: str | None = None) -> dict:
    """Return OWASP Top 10 2021 info. If category_id given (e.g. 'A01'), return that entry."""
    if category_id:
        key = category_id.upper()
        if key in OWASP_TOP_10_2021:
            return {key: OWASP_TOP_10_2021[key]}
        return {"error": f"Category {category_id} not found. Valid: A01-A10"}
    return OWASP_TOP_10_2021


def get_vulnerability_info(vuln_name: str) -> dict:
    """Return detailed info about a specific vulnerability type."""
    key = vuln_name.lower().replace("-", "").replace(" ", "")
    if key in VULNERABILITY_DATABASE:
        return VULNERABILITY_DATABASE[key]

    # Fuzzy match
    for db_key, data in VULNERABILITY_DATABASE.items():
        if key in db_key or db_key in key or key in data["full_name"].lower():
            return data

    available = list(VULNERABILITY_DATABASE.keys())
    return {"error": f"Vulnerability '{vuln_name}' not found.", "available": available}


def get_pentest_methodology(target_type: str = "web") -> dict:
    """Return a structured pentest methodology for the given target type."""
    key = target_type.lower()
    if key in PENTEST_METHODOLOGIES:
        return PENTEST_METHODOLOGIES[key]
    return {
        "error": f"Methodology for '{target_type}' not found.",
        "available": list(PENTEST_METHODOLOGIES.keys()),
    }


def get_tools(category: str | None = None) -> dict:
    """Return security tools, optionally filtered by category."""
    if category:
        key = category.lower().replace(" ", "_").replace("-", "_")
        if key in TOOLS_BY_CATEGORY:
            return {key: TOOLS_BY_CATEGORY[key]}
        return {
            "error": f"Category '{category}' not found.",
            "available": list(TOOLS_BY_CATEGORY.keys()),
        }
    return TOOLS_BY_CATEGORY


def analyze_code_snippet(code: str, language: str = "unknown") -> dict:
    """
    Performs static pattern matching on code snippets to flag common
    insecure patterns. Returns a list of findings with explanations.
    This is a heuristic helper — the LLM does the deep analysis.
    """
    findings = []
    code_lower = code.lower()

    # SQL patterns
    sql_patterns = [
        ("string concatenation in query", ["execute(", "query(", "raw(", "cursor.execute"]),
        ("unparameterized query", ["select * from", "insert into", "delete from", "update "]),
    ]
    for label, patterns in sql_patterns:
        for pat in patterns:
            if pat in code_lower:
                if "?" not in code and "%s" not in code and ":" not in code and "param" not in code_lower:
                    findings.append({
                        "type": "Possible SQL Injection",
                        "detail": f"Found '{pat}' — verify parameterized queries are used.",
                        "severity": "HIGH",
                        "owasp": "A03",
                    })
                    break

    # Hardcoded secrets
    secret_patterns = ["password =", "password=", "secret =", "secret=", "api_key =",
                       "api_key=", "token =", "token=", "private_key"]
    for pat in secret_patterns:
        if pat in code_lower:
            findings.append({
                "type": "Hardcoded Credential / Secret",
                "detail": f"Found potential hardcoded secret pattern: '{pat}'",
                "severity": "HIGH",
                "owasp": "A02",
            })
            break

    # Command injection
    cmd_patterns = ["os.system(", "subprocess.call(", "subprocess.run(", "exec(", "eval(", "shell=true"]
    for pat in cmd_patterns:
        if pat in code_lower:
            findings.append({
                "type": "Possible Command Injection / Code Execution",
                "detail": f"Found '{pat}' — ensure user input never reaches this call.",
                "severity": "CRITICAL",
                "owasp": "A03",
            })

    # XSS in templates
    xss_patterns = ["innerhtml", "document.write(", "dangerouslysetinnerhtml", "|safe", "| safe"]
    for pat in xss_patterns:
        if pat in code_lower:
            findings.append({
                "type": "Possible XSS",
                "detail": f"Found '{pat}' — ensure output is properly escaped.",
                "severity": "HIGH",
                "owasp": "A03",
            })

    # Insecure deserialization
    deser_patterns = ["pickle.loads(", "yaml.load(", "unserialize(", "objectinputstream"]
    for pat in deser_patterns:
        if pat in code_lower:
            findings.append({
                "type": "Insecure Deserialization",
                "detail": f"Found '{pat}' — never deserialize untrusted data.",
                "severity": "HIGH",
                "owasp": "A08",
            })

    # Weak crypto
    crypto_patterns = ["md5(", "sha1(", "des.", "rc4", "hashlib.md5", "hashlib.sha1"]
    for pat in crypto_patterns:
        if pat in code_lower:
            findings.append({
                "type": "Weak Cryptographic Algorithm",
                "detail": f"Found '{pat}' — use SHA-256+ or bcrypt/Argon2 for passwords.",
                "severity": "MEDIUM",
                "owasp": "A02",
            })

    if not findings:
        findings.append({"type": "No obvious patterns detected", "detail": "No common insecure patterns flagged by heuristics. A deeper manual review is still recommended.", "severity": "INFO"})

    return {
        "language": language,
        "lines_analyzed": len(code.splitlines()),
        "findings": findings,
        "note": "This is a heuristic scan. The AI will provide a deeper contextual analysis.",
    }


# Tool definitions in Anthropic tool-use format
TOOL_DEFINITIONS = [
    {
        "name": "get_owasp_info",
        "description": (
            "Returns detailed information about the OWASP Top 10 2021 vulnerability categories. "
            "Use this when the user asks about OWASP, a specific OWASP category (A01-A10), or "
            "general web application security risks."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "category_id": {
                    "type": "string",
                    "description": "Optional OWASP category ID like 'A01', 'A03'. Omit to get all categories.",
                }
            },
        },
    },
    {
        "name": "get_vulnerability_info",
        "description": (
            "Returns technical details, payload examples, detection techniques, and mitigations "
            "for a specific vulnerability type. Supported: xss, sqli, csrf, idor, ssrf, lfi, xxe."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "vuln_name": {
                    "type": "string",
                    "description": "Vulnerability name, e.g., 'xss', 'sqli', 'csrf', 'idor', 'ssrf', 'lfi', 'xxe'",
                }
            },
            "required": ["vuln_name"],
        },
    },
    {
        "name": "get_pentest_methodology",
        "description": (
            "Returns a structured, phase-by-phase penetration testing methodology for a given "
            "target type. Use when users ask how to approach a pentest or security assessment."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "target_type": {
                    "type": "string",
                    "enum": ["web", "network"],
                    "description": "Type of target: 'web' or 'network'. Defaults to 'web'.",
                }
            },
        },
    },
    {
        "name": "get_tools",
        "description": (
            "Returns a curated list of cybersecurity tools organized by category. "
            "Use when users ask about tools for recon, web testing, exploitation, analysis, or post-exploitation."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "enum": ["reconnaissance", "web", "exploitation", "analysis", "post_exploitation"],
                    "description": "Optional category filter. Omit to get all categories.",
                }
            },
        },
    },
    {
        "name": "analyze_code_snippet",
        "description": (
            "Performs static heuristic analysis on a code snippet to flag common insecure patterns "
            "such as SQL injection, hardcoded secrets, command injection, XSS, weak crypto, and "
            "insecure deserialization. Use when a user shares code and asks for a security review."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The source code snippet to analyze.",
                },
                "language": {
                    "type": "string",
                    "description": "Programming language of the snippet (e.g., 'python', 'php', 'javascript').",
                },
            },
            "required": ["code"],
        },
    },
]


def dispatch_tool(tool_name: str, tool_input: dict) -> str:
    """Route a tool call from the agent to the correct function and return JSON string."""
    import json

    functions = {
        "get_owasp_info": get_owasp_info,
        "get_vulnerability_info": get_vulnerability_info,
        "get_pentest_methodology": get_pentest_methodology,
        "get_tools": get_tools,
        "analyze_code_snippet": analyze_code_snippet,
    }

    if tool_name not in functions:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})

    try:
        result = functions[tool_name](**tool_input)
        return json.dumps(result, ensure_ascii=False, indent=2)
    except Exception as exc:
        return json.dumps({"error": str(exc)})
