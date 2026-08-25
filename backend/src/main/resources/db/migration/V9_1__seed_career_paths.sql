INSERT INTO career_paths (name, slug, description, category, required_skills, optional_skills, typical_education, salary_range, growth_outlook) VALUES
('Backend Developer', 'backend-developer', 'Build scalable server-side applications, APIs, and microservices. Work with databases, caching, and cloud infrastructure.', 'Engineering', '["Java","SQL","Spring Boot","REST APIs","Docker","Redis","Git"]', '["Kubernetes","MongoDB","Kafka","GraphQL"]', 'B.Tech Computer Science or equivalent', '₹6-18 LPA', 'High — 25% YoY growth'),
('Frontend Developer', 'frontend-developer', 'Create responsive, performant web interfaces. Master modern frameworks, state management, and design systems.', 'Engineering', '["JavaScript","TypeScript","React","CSS","HTML","Git","Responsive Design"]', '["Next.js","Tailwind CSS","Redux","Testing"]', 'B.Tech Computer Science or equivalent', '₹5-16 LPA', 'High — 22% YoY growth'),
('Full Stack Developer', 'full-stack-developer', 'End-to-end web development spanning frontend UI, backend APIs, databases, and deployment.', 'Engineering', '["JavaScript","TypeScript","React","Node.js","SQL","Git","REST APIs"]', '["Next.js","Docker","PostgreSQL","Redis"]', 'B.Tech Computer Science or equivalent', '₹7-20 LPA', 'Very High — 28% YoY growth'),
('Data Scientist', 'data-scientist', 'Extract insights from complex data using statistics, machine learning, and programming.', 'Data & Analytics', '["Python","SQL","Machine Learning","Statistics","Pandas","NumPy","Data Visualization"]', '["TensorFlow","PySpark","Hadoop","Deep Learning"]', 'B.Tech/MTech with specialization in Data Science or Statistics', '₹8-25 LPA', 'Very High — 35% YoY growth'),
('AI Engineer', 'ai-engineer', 'Build and deploy AI/ML models, design intelligent systems, and work with large language models.', 'Data & Analytics', '["Python","Machine Learning","Deep Learning","TensorFlow","NLP","Computer Vision"]', '["PyTorch","LLMs","MLOps","Kubernetes"]', 'B.Tech/MTech in CS or AI specialization', '₹10-30 LPA', 'Extremely High — 40% YoY growth'),
('DevOps Engineer', 'devOps-engineer', 'Bridge development and operations with CI/CD, infrastructure automation, and cloud platform expertise.', 'Infrastructure', '["Linux","Docker","Kubernetes","CI/CD","AWS","Terraform","Git"]', '["Ansible","Prometheus","Jenkins","Azure"]', 'B.Tech Computer Science or equivalent', '₹7-22 LPA', 'High — 25% YoY growth'),
('Cloud Engineer', 'cloud-engineer', 'Design, build, and manage cloud infrastructure and services on major cloud platforms.', 'Infrastructure', '["AWS","Azure","Terraform","Docker","Kubernetes","Linux","Networking"]', '["GCP","Serverless","Cost Optimization","Security"]', 'B.Tech with Cloud Computing specialization', '₹8-24 LPA', 'High — 23% YoY growth'),
('Cybersecurity Engineer', 'cybersecurity-engineer', 'Protect systems and networks from cyber threats. Design security architecture and conduct audits.', 'Security', '["Network Security","Cryptography","Penetration Testing","SIEM","Linux","Python"]', '["Cloud Security","Compliance","Incident Response","Forensics"]', 'B.Tech CS or Cybersecurity specialization', '₹6-20 LPA', 'High — 25% YoY growth')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, true, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'backend-developer' AND s.name IN ('Java', 'SQL', 'Docker', 'Redis')
ON CONFLICT (career_path_id, skill_id) DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, true, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'frontend-developer' AND s.name IN ('React', 'CSS')
ON CONFLICT (career_path_id, skill_id) DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, true, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'full-stack-developer' AND s.name IN ('React', 'Java', 'SQL')
ON CONFLICT (career_path_id, skill_id) DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, true, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'data-scientist' AND s.name IN ('Python', 'SQL', 'Machine Learning')
ON CONFLICT (career_path_id, skill_id) DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, true, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'ai-engineer' AND s.name IN ('Python', 'Machine Learning')
ON CONFLICT (career_path_id, skill_id) DO NOTHING;

INSERT INTO career_path_skills (career_path_id, skill_id, required, proficiency_level, sort_order)
SELECT cp.id, s.id, true, 'INTERMEDIATE', ROW_NUMBER() OVER (ORDER BY s.name)
FROM career_paths cp
CROSS JOIN skills s
WHERE cp.slug = 'devops-engineer' AND s.name IN ('Docker', 'SQL')
ON CONFLICT (career_path_id, skill_id) DO NOTHING;
