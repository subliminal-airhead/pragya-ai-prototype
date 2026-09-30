import json
import os
from typing import List, Dict, Set, Tuple
from collections import defaultdict
import re

# Load static data files
def load_json_file(filename: str) -> dict:
    """Load JSON file from data directory"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    filepath = os.path.join(base_dir, "data", filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def normalize_skill(skill: str) -> str:
    """
    Deterministic skill normalization: lowercase, trim, basic aliases
    """
    if not skill:
        return ""

    # Convert to lowercase and strip whitespace
    normalized = skill.lower().strip()

    # Remove extra spaces and punctuation (keep alphanumeric and spaces)
    normalized = re.sub(r'[^a-z0-9\s]', '', normalized)
    normalized = re.sub(r'\s+', ' ', normalized).strip()

    # Basic aliases mapping (could be expanded from skills_aliases.json)
    aliases = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'ml': 'machine learning',
        'dl': 'deep learning',
        'ai': 'artificial intelligence',
        'html5': 'html',
        'css3': 'css',
        'nodejs': 'node.js',
        'reactjs': 'react',
        'vuejs': 'vue',
        'angulajs': 'angular',
        'mongodb': 'mongo',
        'postgresql': 'postgres',
        'sqlserver': 'sql server',
        'restapi': 'rest api',
        'graphql': 'graph ql',
        'aws': 'amazon web services',
        'gcp': 'google cloud platform',
        'azure': 'microsoft azure',
        'ci/cd': 'ci cd',
        'tdd': 'test driven development',
        'bdd': 'behavior driven development',
        'oop': 'object oriented programming',
        'fp': 'functional programming',
        'microservices': 'micro services',
        'soa': 'service oriented architecture',
        'etl': 'extract transform load',
        'api': 'application programming interface',
        'ui': 'user interface',
        'ux': 'user experience',
        'qa': 'quality assurance',
        'devops': 'dev ops',
        'sre': 'site reliability engineering',
        'sec': 'security',
        'net': 'network',
        'db': 'database',
        'fe': 'frontend',
        'be': 'backend',
        'fullstack': 'full stack',
        'mobile': 'mobile development',
        'ios': 'iphone os',
        'android': 'android os',
        'reactnative': 'react native',
        'flutter': 'flutter sdk',
        'xamarin': 'xamarin forms',
        'kotlin': 'kotlin lang',
        'swift': 'swift lang',
        'golang': 'go language',
        'rust': 'rust lang',
        'scala': 'scala lang',
        'perl': 'perl lang',
        'ruby': 'ruby lang',
        'php': 'php lang',
        'c#': 'c sharp',
        'c++': 'c plus plus',
        'c': 'c language',
        'java': 'java lang',
        'bash': 'shell scripting',
        'powershell': 'powershell scripting',
        'linux': 'linux os',
        'windows': 'windows os',
        'macos': 'mac os',
        'unix': 'unix os',
        'docker': 'docker container',
        'kubernetes': 'k8s',
        'terraform': 'terraform iac',
        'ansible': 'ansible automation',
        'jenkins': 'jenkins ci',
        'git': 'git version control',
        'svn': 'subversion',
        'jira': 'jira software',
        'confluence': 'confluence wiki',
        'slack': 'slack communication',
        'teams': 'microsoft teams',
        'zoom': 'zoom video',
        'photoshop': 'adobe photoshop',
        'illustrator': 'adobe illustrator',
        'indesign': 'adobe indesign',
        'figma': 'figma design',
        'sketch': 'sketch app',
        'adobe xd': 'adobe xd',
        'after effects': 'adobe after effects',
        'premiere pro': 'adobe premiere pro',
        'final cut': 'final cut pro',
        'audition': 'adobe audition',
        'lightroom': 'adobe lightroom',
        'spark': 'apache spark',
        'hadoop': 'apache hadoop',
        'kafka': 'apache kafka',
        'elasticsearch': 'elastic search',
        'logstash': 'log stash',
        'kibana': 'kibana viz',
        'fluentd': 'fluentd logger',
        'prometheus': 'prometheus monitoring',
        'grafana': 'grafana dashboard',
        'nagios': 'nagios monitoring',
        'zabbix': 'zabbix monitoring',
        'splunk': 'splunk siem',
        'tableau': 'tableau viz',
        'power bi': 'microsoft power bi',
        'qlik': 'qlik sense',
        'looker': 'looker bi',
        'd3': 'd3 js',
        'chartjs': 'chart js',
        'highcharts': 'highcharts lib',
        'leaflet': 'leaflet js',
        'mapbox': 'mapbox gl',
        'arcgis': 'arcgis mapping',
        'qgis': 'qgis desktop',
        'autocad': 'autocad design',
        'solidworks': 'solidworks 3d',
        'blender': 'blender 3d',
        'maya': 'maya 3d',
        '3ds max': '3ds max',
        'cinema 4d': 'cinema 4d',
        'unity': 'unity engine',
        'unreal': 'unreal engine',
        'godot': 'godot engine',
        'directx': 'directx api',
        'opengl': 'opengl graphics',
        'vulkan': 'vulkan api',
        'metal': 'metal api',
        'webgl': 'webgl graphics',
        'svg': 'scalable vector graphics',
        'canvas': 'html canvas',
        'web audio': 'web audio api',
        'webrtc': 'web real-time communication',
        'pwa': 'progressive web app',
        'amp': 'accelerated mobile pages',
        'seo': 'search engine optimization',
        'sem': 'search engine marketing',
        'ppc': 'pay per click',
        'cpc': 'cost per click',
        'cpm': 'cost per mille',
        'ctr': 'click through rate',
        'roi': 'return on investment',
        'roas': 'return on ad spend',
        'ltv': 'lifetime value',
        'cac': 'customer acquisition cost',
        'churn': 'customer churn',
        'retention': 'customer retention',
        'conversion': 'conversion rate',
        'funnel': 'sales funnel',
        'pipeline': 'sales pipeline',
        'lead': 'lead generation',
        'prospect': 'prospecting',
        'closing': 'deal closing',
        'negotiation': 'negotiation skills',
        'presentation': 'presentation skills',
        'public speaking': 'public speaking',
        'storytelling': 'storytelling',
        'copywriting': 'copy writing',
        'content marketing': 'content marketing',
        'social media': 'social media marketing',
        'email marketing': 'email marketing',
        'influencer marketing': 'influencer marketing',
        'affiliate marketing': 'affiliate marketing',
        'growth hacking': 'growth hacking',
        'a/b testing': 'ab testing',
        'multivariate testing': 'multivariate testing',
        'analytics': 'data analytics',
        'business intelligence': 'business intelligence',
        'data mining': 'data mining',
        'data visualization': 'data visualization',
        'etl': 'extract transform load',
        'olap': 'olap cube',
        'data warehousing': 'data warehouse',
        'data lake': 'data lake',
        'data governance': 'data governance',
        'data quality': 'data quality',
        'master data': 'master data management',
        'metadata': 'metadata management',
        'data modeling': 'data modeling',
        'database administration': 'database admin',
        'database design': 'database design',
        'normalization': 'data normalization',
        'denormalization': 'data denormalization',
        'indexing': 'database indexing',
        'partitioning': 'data partitioning',
        'sharding': 'data sharding',
        'replication': 'data replication',
        'backup': 'data backup',
        'recovery': 'data recovery',
        'disaster recovery': 'disaster recovery',
        'high availability': 'high availability',
        'load balancing': 'load balancing',
        'clustering': 'server clustering',
        'virtualization': 'server virtualization',
        'containerization': 'container orchestration',
        'orchestration': 'container orchestration',
        'microservices': 'micro services architecture',
        'serverless': 'serverless computing',
        'faas': 'function as a service',
        'paas': 'platform as a service',
        'iaas': 'infrastructure as a service',
        'saas': 'software as a service',
        'paas': 'platform as a service',
        'iaas': 'infrastructure as a service',
        'daas': 'desktop as a service',
        'baas': 'backend as a service',
        'caas': 'communication as a service',
        'iaas': 'infrastructure as a service',
        'paas': 'platform as a service',
        'saas': 'software as a service',
        # Add common variations
        'machine learning': 'machine learning',
        'deep learning': 'deep learning',
        'artificial intelligence': 'artificial intelligence',
        'natural language processing': 'natural language processing',
        'computer vision': 'computer vision',
        'reinforcement learning': 'reinforcement learning',
        'supervised learning': 'supervised learning',
        'unsupervised learning': 'unsupervised learning',
        'statistics': 'statistics',
        'probability': 'probability',
        'linear algebra': 'linear algebra',
        'calculus': 'calculus',
        'discrete math': 'discrete mathematics',
        'graph theory': 'graph theory',
        'optimization': 'optimization',
        'numerical methods': 'numerical methods',
        'algorithms': 'algorithms',
        'data structures': 'data structures',
        'object oriented': 'object oriented programming',
        'functional programming': 'functional programming',
        'procedural programming': 'procedural programming',
        'design patterns': 'design patterns',
        'software architecture': 'software architecture',
        'software engineering': 'software engineering',
        'agile': 'agile methodology',
        'scrum': 'scrum framework',
        'kanban': 'kanban system',
        'waterfall': 'waterfall model',
        'lean': 'lean development',
        'devops': 'dev ops',
        'sre': 'site reliability engineering',
        'itil': 'itil framework',
        'cobit': 'cobit framework',
        'iso 27001': 'iso 27001',
        'gdpr': 'general data protection regulation',
        'hipaa': 'health insurance portability',
        'pci dss': 'pci dss compliance',
        'sox': 'sarbanes oxley',
        'basel iii': 'basel iii',
        'ifrs': 'international financial reporting',
        'gaap': 'generally accepted accounting',
        # Clean up any remaining empty strings
        '': ''
    }

    # Check if we have a direct alias
    if normalized in aliases:
        return aliases[normalized]

    # Return the normalized skill if no alias found
    return normalized if normalized else skill.lower().strip()

def load_roles_data() -> Dict[str, dict]:
    """Load and index roles data by role_id"""
    roles_raw = load_json_file("roles.json")
    roles_indexed = {}

    for role in roles_raw:
        role_id = role.get("id")
        if role_id:
            # Normalize skills in required_skills
            required_skills = role.get("required_skills", [])
            normalized_required = []
            for skill_item in required_skills:
                if isinstance(skill_item, dict):
                    skill = skill_item.get("skill", "")
                    importance = skill_item.get("importance", "nice_to_have")
                    normalized_skill_name = normalize_skill(skill)
                    normalized_required.append({
                        "skill": normalized_skill_name,
                        "importance": importance,
                        "weight": {"critical": 3, "important": 2, "nice_to_have": 1}.get(importance, 1)
                    })
                else:
                    # Handle case where it's just a string
                    normalized_skill_name = normalize_skill(str(skill_item))
                    normalized_required.append({
                        "skill": normalized_skill_name,
                        "importance": "nice_to_have",
                        "weight": 1
                    })

            roles_indexed[role_id] = {
                "title": role.get("title", ""),
                "required_skills": normalized_required,
                "growth_outlook": role.get("growth_outlook", ""),
                "indicative_entry_salary_lpa": role.get("indicative_entry_salary_lpa"),
                "category": role.get("category", ""),
                "typical_education": role.get("typical_education", ""),
                "related_roles": role.get("related_roles", []),
                "interview_topics": role.get("interview_topics", [])
            }

    return roles_indexed

def analyze_skill_gap(student_skills: List[str], target_role_id: str) -> Tuple[List[str], List[dict], int]:
    """
    Pure set-difference gap analysis: missing_skills = target_role_required - student_skills
    Returns: (matched_skills_list, missing_skills_list_with_importance, readiness_pct)
    """
    # Normalize student skills
    normalized_student_skills = set()
    for skill in student_skills:
        if skill and skill.strip():
            normalized = normalize_skill(skill.strip())
            if normalized:
                normalized_student_skills.add(normalized)

    # Load roles data
    roles_data = load_roles_data()

    if target_role_id not in roles_data:
        # Return empty results if role not found
        return [], [], 0

    role_data = roles_data[target_role_id]
    required_skills = role_data["required_skills"]

    # Calculate matched and missing skills
    matched_skills = []
    missing_skills = []
    total_weight = 0
    matched_weight = 0

    for skill_item in required_skills:
        skill_name = skill_item["skill"]
        importance = skill_item["importance"]
        weight = skill_item["weight"]

        total_weight += weight

        if skill_name in normalized_student_skills:
            matched_skills.append(skill_name)
            matched_weight += weight
        else:
            missing_skills.append({
                "skill": skill_name,
                "importance": importance,
                "reason": f"This skill is {importance} for the {role_data['title']} role"
            })

    # Calculate readiness percentage
    readiness_pct = 0
    if total_weight > 0:
        readiness_pct = round((matched_weight / total_weight) * 100)

    return matched_skills, missing_skills, readiness_pct

def calculate_employability_score(
    skills_match_pct: int,
    project_count: int,
    project_skills_relevance: float,
    education_level: str,
    has_internship: bool,
    resume_quality_score: int
) -> dict:
    """
    Deterministic Employability Score (0–100) using a clear rubric:
    Skills overlap (40 pts), Projects present (25 pts), Degree/academics (20 pts), Formatting/metrics (15 pts).
    """
    # Skills component (40% weight)
    skills_score = min(skills_match_pct, 100)  # Already 0-100 from gap analysis
    skills_points = skills_score * 0.4  # 40% weight

    # Projects component (25% weight)
    # Base points for having projects, bonus for relevance
    project_base = min(project_count * 5, 25)  # Up to 25 points for project count (5 per project, max 5 projects)
    project_relevance_bonus = project_skills_relevance * 0.25  # Up to 25 points for relevance
    projects_points = min(project_base + project_relevance_bonus, 25)  # Cap at 25

    # Academics component (20% weight)
    education_scores = {
        "phd": 20,
        "master's": 18,
        "bachelor's": 16,
        "associate's": 12,
        "diploma": 10,
        "high school": 8,
        "none": 0,
        "unknown": 0
    }
    academics_points = education_scores.get(education_level.lower(), 0)

    # Formatting/metrics component (15% weight)
    # This comes from resume_quality_score (0-100) from LLM review
    formatting_points = (resume_quality_score / 100) * 15  # Convert to 15-point scale

    # Calculate total
    total_points = skills_points + projects_points + academics_points + formatting_points
    total_score = round(total_points)

    # Ensure score is within bounds
    total_score = max(0, min(100, total_score))

    # Return breakdown
    return {
        "total": total_score,
        "components": [
            {
                "name": "skills",
                "score": round(skills_points / 0.4),  # Convert back to 0-100 scale
                "weight": 0.4,
                "note": f"Skills match: {skills_match_pct}%"
            },
            {
                "name": "projects",
                "score": round(projects_points / 0.25),  # Convert back to 0-100 scale
                "weight": 0.25,
                "note": f"{project_count} projects with {project_skills_relevance*100:.0f}% relevance"
            },
            {
                "name": "experience",
                "score": 20 if has_internship else 0,  # Simplified - could be more sophisticated
                "weight": 0.15,
                "note": "Internship experience" if has_internship else "No internship experience"
            },
            {
                "name": "resume_quality",
                "score": resume_quality_score,
                "weight": 0.15,
                "note": "Resume formatting and metrics"
            },
            {
                "name": "certifications",
                "score": 10,  # Placeholder - could be based on actual certifications
                "weight": 0.10,
                "note": "Relevant certifications"
            }
        ]
    }

def match_courses_to_skills(missing_skills: List[dict], courses_data: List[dict]) -> List[dict]:
    """
    Deterministic Course Matching: In-memory filter returning courses whose skills_covered
    intersect with missing_skills.
    """
    if not missing_skills or not courses_data:
        return []

    # Extract missing skill names
    missing_skill_names = {item["skill"] for item in missing_skills}

    matched_courses = []

    for course in courses_data:
        course_skills = set()
        for skill in course.get("skills_covered", []):
            normalized_skill = normalize_skill(skill)
            if normalized_skill:
                course_skills.add(normalized_skill)

        # Check if there's any intersection
        intersection = course_skills & missing_skill_names
        if intersection:
            # Calculate match score based on percentage of missing skills covered
            skills_covered_count = len(intersection)
            total_missing_count = len(missing_skill_names)
            match_score = round((skills_covered_count / total_missing_count) * 100) if total_missing_count > 0 else 0

            course_copy = course.copy()
            course_copy["match_score"] = match_score
            course_copy["matched_skills"] = list(intersection)
            matched_courses.append(course_copy)

    # Sort by match score descending, then by cost (free first), then by duration
    matched_courses.sort(key=lambda x: (-x.get("match_score", 0), x.get("cost_inr", float('inf')), x.get("duration_weeks", 0)))

    return matched_courses

# Initialize static data on module load
_ROLES_DATA = None
_COURSES_DATA = None
_INTERNSHIPS_DATA = None
_GOVT_SCHEMES_DATA = None

def get_roles_data() -> Dict[str, dict]:
    global _ROLES_DATA
    if _ROLES_DATA is None:
        _ROLES_DATA = load_roles_data()
    return _ROLES_DATA

def get_courses_data() -> List[dict]:
    global _COURSES_DATA
    if _COURSES_DATA is None:
        _COURSES_DATA = load_json_file("courses.json")
    return _COURSES_DATA

def get_internships_data() -> List[dict]:
    global _INTERNSHIPS_DATA
    if _INTERNSHIPS_DATA is None:
        _INTERNSHIPS_DATA = load_json_file("internships.json")
    return _INTERNSHIPS_DATA

def get_govt_schemes_data() -> List[dict]:
    global _GOVT_SCHEMES_DATA
    if _GOVT_SCHEMES_DATA is None:
        _GOVT_SCHEMES_DATA = load_json_file("govt_schemes.json")
    return _GOVT_SCHEMES_DATA