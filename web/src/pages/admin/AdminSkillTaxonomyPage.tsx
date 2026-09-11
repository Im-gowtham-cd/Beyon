import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderTree,
  Search,
  RefreshCw,
  Eye,
  X,
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ListFilter,
  BarChart3,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronRight,
  Wand2,
  FileText,
} from 'lucide-react';
import styles from './AdminHome.module.css';

interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
}

interface SkillItem {
  id: string;
  name: string;
  slug: string;
  category?: string;
  categoryId?: string;
  description?: string;
  active: boolean;
  topicCount?: number;
  createdAt?: string;
}

interface LessonItem {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
}

interface ChapterItem {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  lessonCount?: number;
  lessons: LessonItem[];
}

interface SkillCurriculum {
  skill: SkillItem;
  chapters: ChapterItem[];
  totalChapters: number;
  totalLessons: number;
  enrolledStudents: number;
}

export function AdminSkillTaxonomyPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'EXPLORER' | 'REGISTRY'>('EXPLORER');
  const [activeDrilldownDomain, setActiveDrilldownDomain] = useState<SkillCategory | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTab, setCreateTab] = useState<'DETAILS' | 'CURRICULUM'>('DETAILS');
  const [createChapters, setCreateChapters] = useState<ChapterItem[]>([]);
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    demand: 'HIGH',
    salary: '$95,000 - $160,000',
    growth: '+24% YoY',
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const [skillToEdit, setSkillToEdit] = useState<SkillItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const [skillToDelete, setSkillToDelete] = useState<SkillItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Course & Curriculum Manager Modal States
  const [activeCurriculumSkill, setActiveCurriculumSkill] = useState<SkillItem | null>(null);
  const [curriculumData, setCurriculumData] = useState<SkillCurriculum | null>(null);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Chapter editing/creating
  const [editingChapter, setEditingChapter] = useState<{ chapterId?: string; name: string; slug: string; description: string; displayOrder: number } | null>(null);
  const [submittingChapter, setSubmittingChapter] = useState(false);

  // Lesson editing/creating
  const [editingLesson, setEditingLesson] = useState<{ lessonId?: string; topicId: string; name: string; slug: string; description: string; displayOrder: number } | null>(null);
  const [submittingLesson, setSubmittingLesson] = useState(false);

  const [inspectNode, setInspectNode] = useState<{
    type: 'CATEGORY' | 'SKILL';
    item: any;
    domainName?: string;
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchTaxonomyData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [catRes, skillRes] = await Promise.all([
        fetch('/api/v1/taxonomy/categories', { headers }).catch(() => null),
        fetch('/api/v1/taxonomy/skills', { headers }).catch(() => null),
      ]);

      if (catRes && catRes.ok) {
        const data = await catRes.json();
        setCategories(data.data || []);
      }
      if (skillRes && skillRes.ok) {
        const data = await skillRes.json();
        setSkills(data.data || []);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomyData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, SkillCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const skillsCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    skills.forEach((s) => {
      if (s.categoryId) {
        map.set(s.categoryId, (map.get(s.categoryId) || 0) + 1);
      }
    });
    return map;
  }, [skills]);

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const catId = s.categoryId || '';
      const catName = categoryMap.get(catId)?.name || s.category || '';
      const matchesCategory =
        selectedCategory === 'ALL' || s.categoryId === selectedCategory;
      const matchesSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
        catName.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [skills, selectedCategory, search, categoryMap]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [categories, search]);

  const skillsInActiveDomain = useMemo(() => {
    if (!activeDrilldownDomain) return [];
    return skills.filter((s) => s.categoryId === activeDrilldownDomain.id);
  }, [skills, activeDrilldownDomain]);

  // Handle Create Skill
  const handleNameChange = (val: string) => {
    const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setCreateForm((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug,
    }));
  };

  const submitCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast('Error: Skill name is required.');
      return;
    }
    if (!createForm.categoryId) {
      showToast('Error: Please select a domain category.');
      return;
    }

    setSubmittingCreate(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/taxonomy/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: createForm.name.trim(),
          slug: createForm.slug.trim() || createForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
          categoryId: createForm.categoryId,
          description: createForm.description.trim() || `${createForm.name.trim()} competencies and engineering standards.`,
          chapters: createChapters.length > 0 ? createChapters : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const created: SkillItem = data.data || {
          id: String(Date.now()),
          name: createForm.name.trim(),
          slug: createForm.slug.trim(),
          categoryId: createForm.categoryId,
          category: categoryMap.get(createForm.categoryId)?.name || 'General',
          description: createForm.description.trim(),
          active: true,
          topicCount: createChapters.length || 2,
        };

        setSkills((prev) => [created, ...prev]);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          slug: '',
          categoryId: '',
          description: '',
          demand: 'HIGH',
          salary: '$95,000 - $160,000',
          growth: '+24% YoY',
        });
        setCreateChapters([]);
        setCreateTab('DETAILS');
        showToast(`Course "${created.name}" created with ${created.topicCount || 0} chapters & mapped to taxonomy.`);
        fetchTaxonomyData();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Failed to create skill: ${err.message || 'Server error'}`);
      }
    } catch {
      showToast('Network error while creating skill. Please verify connection.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Handle Edit Skill
  const openEditModal = (skill: SkillItem) => {
    setSkillToEdit(skill);
    setEditForm({
      name: skill.name,
      slug: skill.slug,
      categoryId: skill.categoryId || '',
      description: skill.description || '',
    });
  };

  const submitEditSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillToEdit) return;

    setSubmittingEdit(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/taxonomy/skills/${skillToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug: editForm.slug.trim(),
          categoryId: editForm.categoryId,
          description: editForm.description.trim(),
        }),
      });

      if (res.ok) {
        setSkills((prev) =>
          prev.map((s) =>
            s.id === skillToEdit.id
              ? {
                  ...s,
                  name: editForm.name.trim(),
                  slug: editForm.slug.trim(),
                  categoryId: editForm.categoryId,
                  category: categoryMap.get(editForm.categoryId)?.name || s.category,
                  description: editForm.description.trim(),
                }
              : s
          )
        );
        setSkillToEdit(null);
        showToast(`Skill "${editForm.name}" updated successfully.`);
      } else {
        showToast('Failed to update skill.');
      }
    } catch {
      showToast('Network error while updating skill.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handle Delete Skill
  const submitDeleteSkill = async () => {
    if (!skillToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/taxonomy/skills/${skillToDelete.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.id !== skillToDelete.id));
        showToast(`Skill "${skillToDelete.name}" deleted from taxonomy registry.`);
        setSkillToDelete(null);
      } else {
        showToast('Failed to delete skill. Please check server permissions.');
      }
    } catch {
      showToast('Network error while deleting skill.');
    } finally {
      setDeleting(false);
    }
  };

  // Auto-generate course curriculum blueprint
  const handleAutoGenerateCurriculum = (skillName: string) => {
    const title = skillName.trim() || 'Engineering Track';
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const generated: ChapterItem[] = [
      {
        name: `1. ${title} Foundations & Core Architecture`,
        slug: `1-${slugBase}-foundations-architecture`,
        description: `Runtime fundamentals, development environment setup, syntax primitives, and execution model for ${title}.`,
        displayOrder: 1,
        lessons: [
          {
            name: `${title} Architecture & Core Principles`,
            slug: `${slugBase}-core-principles`,
            description: `Core execution lifecycle, internal engine structures, and fundamental paradigms.`,
            displayOrder: 1,
          },
          {
            name: `Environment Toolchain & Diagnostics Setup`,
            slug: `${slugBase}-environment-setup`,
            description: `Configuring compiler/runtime dependencies, CLI tooling, and developer debugging environments.`,
            displayOrder: 2,
          },
          {
            name: `Idiomatic Syntax & Standard Library`,
            slug: `${slugBase}-syntax-standard-library`,
            description: `Language types, memory conventions, and idiomatic baseline implementations.`,
            displayOrder: 3,
          },
        ],
      },
      {
        name: `2. Practical Implementation & Design Patterns`,
        slug: `2-${slugBase}-implementation-patterns`,
        description: `Hands-on module development, asynchronous workflows, clean API boundaries, and design patterns.`,
        displayOrder: 2,
        lessons: [
          {
            name: `Enterprise Design Patterns & Abstractions`,
            slug: `${slugBase}-design-patterns`,
            description: `Dependency inversion, decoupled architectural layers, and clean boundary contracts.`,
            displayOrder: 1,
          },
          {
            name: `Async Processing & Data Pipelines`,
            slug: `${slugBase}-async-data-pipelines`,
            description: `Handling asynchronous I/O, streaming events, and backpressure safely.`,
            displayOrder: 2,
          },
          {
            name: `Data Persistence & Client Integration`,
            slug: `${slugBase}-persistence-integrations`,
            description: `Database transactions, ORM mappings, and REST/gRPC client integrations.`,
            displayOrder: 3,
          },
        ],
      },
      {
        name: `3. Production Scaling, Security & Cloud Operations`,
        slug: `3-${slugBase}-production-scaling`,
        description: `High-throughput optimization, security hardening, container deployment, and telemetry.`,
        displayOrder: 3,
        lessons: [
          {
            name: `Performance Profiling & Bottleneck Mitigation`,
            slug: `${slugBase}-performance-profiling`,
            description: `Benchmarking p99 latency, garbage collection/memory analysis, and caching strategies.`,
            displayOrder: 1,
          },
          {
            name: `Security Hardening & Secret Governance`,
            slug: `${slugBase}-security-hardening`,
            description: `Authentication, JWT/RBAC policies, sanitization, and compliance defense.`,
            displayOrder: 2,
          },
          {
            name: `Telemetry, Monitoring & Production Deployment`,
            slug: `${slugBase}-monitoring-deployment`,
            description: `Distributed tracing, health probes, Docker containerization, and zero-downtime rollouts.`,
            displayOrder: 3,
          },
        ],
      },
    ];
    setCreateChapters(generated);
  };

  const addCreateChapter = () => {
    const num = createChapters.length + 1;
    const baseName = createForm.name.trim() || 'Competency';
    const slugBase = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setCreateChapters((prev) => [
      ...prev,
      {
        name: `Chapter ${num}: ${baseName} Engineering Core`,
        slug: `chapter-${num}-${slugBase || 'topic'}`,
        description: `Deep dive into Chapter ${num} design and implementation.`,
        displayOrder: num,
        lessons: [
          {
            name: `Lesson 1: Foundations & Architecture`,
            slug: `ch-${num}-lesson-1-foundations`,
            description: `Core concepts and prerequisites.`,
            displayOrder: 1,
          },
        ],
      },
    ]);
  };

  const removeCreateChapter = (idx: number) => {
    setCreateChapters((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCreateChapter = (idx: number, field: keyof ChapterItem, val: any) => {
    setCreateChapters((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const addCreateLesson = (chapterIdx: number) => {
    setCreateChapters((prev) => {
      const copy = [...prev];
      const ch = copy[chapterIdx];
      const lessonNum = (ch.lessons?.length || 0) + 1;
      const chNum = chapterIdx + 1;
      ch.lessons = [
        ...(ch.lessons || []),
        {
          name: `Lesson ${lessonNum}: Practical Implementation`,
          slug: `ch-${chNum}-lesson-${lessonNum}`,
          description: `Hands-on module walk-through.`,
          displayOrder: lessonNum,
        },
      ];
      return copy;
    });
  };

  const removeCreateLesson = (chapterIdx: number, lessonIdx: number) => {
    setCreateChapters((prev) => {
      const copy = [...prev];
      copy[chapterIdx].lessons = copy[chapterIdx].lessons.filter((_, i) => i !== lessonIdx);
      return copy;
    });
  };

  const updateCreateLesson = (chapterIdx: number, lessonIdx: number, field: keyof LessonItem, val: any) => {
    setCreateChapters((prev) => {
      const copy = [...prev];
      const lessons = [...(copy[chapterIdx].lessons || [])];
      lessons[lessonIdx] = { ...lessons[lessonIdx], [field]: val };
      copy[chapterIdx].lessons = lessons;
      return copy;
    });
  };

  // Open Curriculum Manager Modal
  const openCurriculumModal = async (skill: SkillItem) => {
    setActiveCurriculumSkill(skill);
    setCurriculumData(null);
    setLoadingCurriculum(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/v1/taxonomy/skills/${skill.id}/curriculum`, { headers });
      if (res.ok) {
        const json = await res.json();
        setCurriculumData(json.data);
        const exp: Record<string, boolean> = {};
        (json.data.chapters || []).forEach((c: any) => {
          exp[c.id] = true;
        });
        setExpandedChapters(exp);
      }
    } catch {
      showToast('Failed to load curriculum details');
    } finally {
      setLoadingCurriculum(false);
    }
  };

  const refreshCurriculum = async (skillId: string) => {
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/v1/taxonomy/skills/${skillId}/curriculum`, { headers });
      if (res.ok) {
        const json = await res.json();
        setCurriculumData(json.data);
      }
    } catch {}
  };

  const toggleChapterExpand = (chapterId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  // Chapter CRUD
  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter || !activeCurriculumSkill) return;
    setSubmittingChapter(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const isEdit = !!editingChapter.chapterId;
      const url = isEdit
        ? `/api/v1/taxonomy/topics/${editingChapter.chapterId}`
        : `/api/v1/taxonomy/skills/${activeCurriculumSkill.id}/topics`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          name: editingChapter.name.trim(),
          slug: editingChapter.slug.trim() || editingChapter.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
          description: editingChapter.description.trim(),
          displayOrder: editingChapter.displayOrder,
        }),
      });

      if (res.ok) {
        showToast(isEdit ? 'Chapter updated successfully' : 'New chapter added to course');
        setEditingChapter(null);
        await refreshCurriculum(activeCurriculumSkill.id);
        fetchTaxonomyData();
      } else {
        showToast('Failed to save chapter');
      }
    } catch {
      showToast('Network error saving chapter');
    } finally {
      setSubmittingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string, chapterName: string) => {
    if (!activeCurriculumSkill) return;
    if (!window.confirm(`Delete chapter "${chapterName}" and all its lessons?`)) return;
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/taxonomy/topics/${chapterId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        showToast(`Chapter "${chapterName}" deleted`);
        await refreshCurriculum(activeCurriculumSkill.id);
        fetchTaxonomyData();
      } else {
        showToast('Failed to delete chapter');
      }
    } catch {
      showToast('Network error deleting chapter');
    }
  };

  // Lesson CRUD
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !activeCurriculumSkill) return;
    setSubmittingLesson(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const isEdit = !!editingLesson.lessonId;
      const url = isEdit
        ? `/api/v1/taxonomy/subtopics/${editingLesson.lessonId}`
        : `/api/v1/taxonomy/topics/${editingLesson.topicId}/subtopics`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          name: editingLesson.name.trim(),
          slug: editingLesson.slug.trim() || editingLesson.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
          description: editingLesson.description.trim(),
          displayOrder: editingLesson.displayOrder,
        }),
      });

      if (res.ok) {
        showToast(isEdit ? 'Lesson updated successfully' : 'New lesson added to chapter');
        setEditingLesson(null);
        await refreshCurriculum(activeCurriculumSkill.id);
      } else {
        showToast('Failed to save lesson');
      }
    } catch {
      showToast('Network error saving lesson');
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteLesson = async (subtopicId: string, lessonName: string) => {
    if (!activeCurriculumSkill) return;
    if (!window.confirm(`Delete lesson "${lessonName}"?`)) return;
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/taxonomy/subtopics/${subtopicId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        showToast(`Lesson "${lessonName}" removed`);
        await refreshCurriculum(activeCurriculumSkill.id);
      } else {
        showToast('Failed to delete lesson');
      }
    } catch {
      showToast('Network error deleting lesson');
    }
  };

  return (
    <div className={styles.page}>
      {/* Top Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '4px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#1c2d81',
                background: '#fed601',
                padding: '3px 8px',
                letterSpacing: '0.04em',
              }}
            >
              STANDARDIZED TAXONOMY
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#15803d',
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                padding: '3px 8px',
              }}
            >
              ✓ 24 DOMAINS • {skills.length || 109} COMPETENCIES
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#1c2d81',
              margin: '0 0 4px',
              letterSpacing: '-0.02em',
            }}
          >
            Skill Taxonomy &amp; Hierarchy Management
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Curate domain categories, author new technical competencies, and manage question bank mappings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setCreateForm({
                name: '',
                slug: '',
                categoryId: activeDrilldownDomain ? activeDrilldownDomain.id : (categories[0]?.id || ''),
                description: '',
                demand: 'HIGH',
                salary: '$95,000 - $160,000',
                growth: '+24% YoY',
              });
              setShowCreateModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1c2d81',
              color: '#fed601',
              border: '1px solid #1c2d81',
              padding: '8px 18px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              borderRadius: '3px',
              boxShadow: '0 2px 4px rgba(28, 45, 129, 0.15)',
            }}
          >
            <Plus size={16} />
            <span>Create Skill</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fetchTaxonomyData();
              showToast('Taxonomy registry re-synchronized with live Dolt DB.');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: '#1c2d81',
              borderRadius: '3px',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/skills/graph"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1px solid #1c2d81',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 800,
              textDecoration: 'none',
              cursor: 'pointer',
              color: '#1c2d81',
              borderRadius: '3px',
            }}
          >
            <BarChart3 size={15} />
            <span>Skill Graph</span>
          </Link>

          <Link
            to="/admin/questions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              color: '#1c2d81',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              textDecoration: 'none',
              cursor: 'pointer',
              borderRadius: '3px',
            }}
          >
            <HelpCircle size={15} />
            <span>Question Bank</span>
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            padding: '12px 18px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '2px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Competencies</span>
            <div className={styles.kpiIcon}>
              <Layers size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>{skills.length || 109}</div>
          <div className={styles.kpiSub}>
            <Sparkles size={13} />
            <span>100% Mapped to Question Bank</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Knowledge Domains</span>
            <div className={styles.kpiIcon}>
              <FolderTree size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>{categories.length || 24}</div>
          <div className={styles.kpiSub}>
            <Activity size={13} />
            <span>Root Categories in Dolt</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Industry Demand</span>
            <div className={styles.kpiIcon}>
              <TrendingUp size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>94.2% HIGH</div>
          <div className={styles.kpiSub}>
            <span>+24% YoY Hiring Velocity</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Median Compensation</span>
            <div className={styles.kpiIcon}>
              <DollarSign size={17} />
            </div>
          </div>
          <div className={styles.kpiValue}>$118,500</div>
          <div className={styles.kpiSub}>
            <span>Global Market Benchmark</span>
          </div>
        </div>
      </div>

      {/* View Tabs & Control Bar */}
      <div className={styles.tabBar}>
        <button
          type="button"
          className={`${styles.tabBtn} ${viewMode === 'EXPLORER' ? styles.tabBtnActive : ''}`}
          onClick={() => {
            setViewMode('EXPLORER');
            setActiveDrilldownDomain(null);
          }}
        >
          <FolderTree size={15} />
          <span>Hierarchy Tree Explorer</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${viewMode === 'REGISTRY' ? styles.tabBtnActive : ''}`}
          onClick={() => {
            setViewMode('REGISTRY');
            setActiveDrilldownDomain(null);
          }}
        >
          <ListFilter size={15} />
          <span>Full Competency Registry ({skills.length || 109})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <Search
              size={16}
              color="#64748b"
              style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search domains, competencies, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                outline: 'none',
                borderRadius: '3px',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Domain:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                if (e.target.value !== 'ALL') {
                  const found = categories.find((c) => c.id === e.target.value);
                  if (found) setActiveDrilldownDomain(found);
                } else {
                  setActiveDrilldownDomain(null);
                }
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#1c2d81',
                cursor: 'pointer',
                borderRadius: '3px',
              }}
            >
              <option value="ALL">All Domains ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({skillsCountByCategory.get(c.id) || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
          <span>Displaying</span>
          <strong style={{ color: '#1c2d81' }}>
            {viewMode === 'EXPLORER'
              ? activeDrilldownDomain
                ? `${skillsInActiveDomain.length} skills in ${activeDrilldownDomain.name}`
                : `${filteredCategories.length} Domains`
              : `${filteredSkills.length} of ${skills.length} Competencies`}
          </strong>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'EXPLORER' ? (
        activeDrilldownDomain ? (
          /* Domain Drilldown View */
          <div>
            {/* Breadcrumb row with Add Skill button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDrilldownDomain(null);
                    setSelectedCategory('ALL');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#1c2d81',
                    cursor: 'pointer',
                    borderRadius: '3px',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>All Domains</span>
                </button>
                <span style={{ color: '#94a3b8' }}>/</span>
                <span style={{ fontWeight: 800, color: '#1c2d81', fontSize: '1rem' }}>
                  {activeDrilldownDomain.name}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: '#eff6ff',
                    color: '#1c2d81',
                    border: '1px solid #bfdbfe',
                    padding: '2px 8px',
                    fontWeight: 800,
                    borderRadius: '20px',
                  }}
                >
                  {skillsInActiveDomain.length} COMPETENCIES
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateForm({
                    name: '',
                    slug: '',
                    categoryId: activeDrilldownDomain.id,
                    description: '',
                    demand: 'HIGH',
                    salary: '$95,000 - $160,000',
                    growth: '+24% YoY',
                  });
                  setShowCreateModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#1c2d81',
                  color: '#fed601',
                  border: '1px solid #1c2d81',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  borderRadius: '3px',
                }}
              >
                <Plus size={14} />
                <span>Add Skill to {activeDrilldownDomain.name}</span>
              </button>
            </div>

            {/* Grid of skills within this domain */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {skillsInActiveDomain.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderTop: '3px solid #1c2d81',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderRadius: '2px',
                    transition: 'box-shadow 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1c2d81', letterSpacing: '-0.01em' }}>
                        {skill.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          padding: '2px 7px',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          borderRadius: '2px',
                        }}
                      >
                        HIGH DEMAND
                      </span>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '8px' }}>
                      Canonical: <code>{skill.slug}</code>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, minHeight: '38px' }}>
                      {skill.description || `${skill.name} engineering competencies and assessment benchmarks.`}
                    </p>
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '8px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      borderRadius: '2px',
                    }}
                  >
                    <span>Chapters: <strong style={{ color: '#1c2d81' }}>{skill.topicCount || 0} Modules</strong></span>
                    <span>Salary: <strong style={{ color: '#15803d' }}>$90k - $160k</strong></span>
                  </div>

                  {/* Symmetrical Action Button Row */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setInspectNode({ type: 'SKILL', item: skill, domainName: activeDrilldownDomain.name })}
                      title="Inspect Skill"
                      style={{
                        height: '34px',
                        padding: '0 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#1c2d81',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                      }}
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openCurriculumModal(skill)}
                      title="Manage Course Chapters & Lessons"
                      style={{
                        height: '34px',
                        padding: '0 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1d4ed8',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                      }}
                    >
                      <BookOpen size={13} />
                      <span>Curriculum ({skill.topicCount || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(skill)}
                      title="Edit Skill"
                      style={{
                        height: '34px',
                        padding: '0 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>

                    <Link
                      to={`/admin/questions?search=${encodeURIComponent(skill.name)}`}
                      title="View Questions"
                      style={{
                        flex: 1,
                        height: '34px',
                        padding: '0 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: '#1c2d81',
                        border: '1px solid #1c2d81',
                        color: '#fed601',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                      }}
                    >
                      <HelpCircle size={13} />
                      <span>Questions</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSkillToDelete(skill)}
                      title="Delete Skill"
                      style={{
                        height: '34px',
                        width: '34px',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#ffffff',
                        border: '1px solid #fee2e2',
                        color: '#ef4444',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Domain Grid View (Fixed and Harmonized) */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredCategories.map((cat) => {
              const skillCount = skillsCountByCategory.get(cat.id) || 0;
              return (
                <div
                  key={cat.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderTop: '3px solid #1c2d81',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderRadius: '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div>
                    {/* Header with icon, title, and count badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1c2d81',
                          }}
                        >
                          <FolderTree size={18} />
                        </div>
                        <div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              color: '#1c2d81',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {cat.name}
                          </h3>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                            Canonical: <code>{cat.slug}</code>
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: '#1c2d81',
                          background: '#fed601',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        #{cat.displayOrder}
                      </span>
                    </div>

                    <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, minHeight: '36px' }}>
                      Encompasses {skillCount} core competencies mapped to standardized technical evaluations.
                    </p>
                  </div>

                  {/* Info metric strip */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      borderRadius: '2px',
                    }}
                  >
                    <span style={{ color: '#64748b' }}>Curriculum Coverage</span>
                    <strong style={{ color: '#1c2d81', fontSize: '0.86rem' }}>{skillCount} Verified Skills</strong>
                  </div>

                  {/* Symmetrical Action Button Row (Fixed Height, No Line Breaks) */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setInspectNode({ type: 'CATEGORY', item: cat })}
                      style={{
                        height: '36px',
                        padding: '0 14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#1c2d81',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                      }}
                    >
                      <Eye size={14} />
                      <span>Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDrilldownDomain(cat);
                        setSelectedCategory(cat.id);
                      }}
                      style={{
                        flex: 1,
                        height: '36px',
                        padding: '0 16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#1c2d81',
                        border: '1px solid #1c2d81',
                        color: '#fed601',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <span>Explore Skills ({skillCount})</span>
                      <ArrowRight size={14} color="#fed601" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Full Registry Table View */
        <div className={styles.tableCard}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Competency / Skill</th>
                <th style={{ width: '18%' }}>Domain Category</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Hierarchy Level</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Industry Demand</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Chapters</th>
                <th style={{ width: '22%', textAlign: 'center' }}>Actions &amp; Options</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No competencies match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSkills.map((skill) => {
                  const cat = skill.categoryId ? categoryMap.get(skill.categoryId) : null;
                  const catName = cat ? cat.name : skill.category || 'General';

                  return (
                    <tr key={skill.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1c2d81', fontSize: '0.9rem' }}>
                          {skill.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          <code>{skill.slug}</code> • {skill.description ? (skill.description.length > 55 ? `${skill.description.substring(0, 55)}...` : skill.description) : 'Technical competency'}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#1c2d81',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            padding: '3px 8px',
                            display: 'inline-block',
                            borderRadius: '2px',
                          }}
                        >
                          {catName}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: '#6b21a8',
                            background: '#faf5ff',
                            border: '1px solid #e9d5ff',
                            padding: '2px 8px',
                            borderRadius: '2px',
                          }}
                        >
                          SKILL
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: '#15803d',
                            background: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            padding: '2px 8px',
                            borderRadius: '2px',
                          }}
                        >
                          HIGH
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#1c2d81' }}>
                        {skill.topicCount || 0}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setInspectNode({ type: 'SKILL', item: skill, domainName: catName })}
                            title="Inspect Competency"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#1c2d81',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              height: '28px',
                              borderRadius: '2px',
                            }}
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openCurriculumModal(skill)}
                            title="Manage Course Chapters & Lessons"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              height: '28px',
                              borderRadius: '2px',
                            }}
                          >
                            <BookOpen size={13} />
                            <span>Curriculum</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(skill)}
                            title="Edit Skill"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#475569',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              height: '28px',
                              borderRadius: '2px',
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <Link
                            to={`/admin/questions?search=${encodeURIComponent(skill.name)}`}
                            title="View in Question Bank"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#1c2d81',
                              border: '1px solid #1c2d81',
                              color: '#fed601',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textDecoration: 'none',
                              cursor: 'pointer',
                              height: '28px',
                              boxSizing: 'border-box',
                              borderRadius: '2px',
                            }}
                          >
                            <HelpCircle size={13} />
                            <span>Questions</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setSkillToDelete(skill)}
                            title="Delete Skill"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #fee2e2',
                              color: '#ef4444',
                              width: '28px',
                              height: '28px',
                              padding: 0,
                              cursor: 'pointer',
                              borderRadius: '2px',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE SKILL MODAL */}
      {/* CREATE SKILL & COURSE MODAL */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #1c2d81',
              width: '100%',
              maxWidth: '740px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: '#1c2d81',
                color: '#ffffff',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={20} color="#fed601" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                    Create New Technical Skill &amp; Course Track
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#93c5fd', marginTop: '1px' }}>
                    Standardized taxonomy node &amp; student online learning syllabus
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                padding: '0 20px',
              }}
            >
              <button
                type="button"
                onClick={() => setCreateTab('DETAILS')}
                style={{
                  padding: '12px 18px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'none',
                  border: 'none',
                  borderBottom: createTab === 'DETAILS' ? '2px solid #1c2d81' : '2px solid transparent',
                  color: createTab === 'DETAILS' ? '#1c2d81' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Layers size={14} color={createTab === 'DETAILS' ? '#1c2d81' : '#94a3b8'} />
                <span>1. Competency Details</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (createChapters.length === 0 && createForm.name.trim()) {
                    handleAutoGenerateCurriculum(createForm.name);
                  }
                  setCreateTab('CURRICULUM');
                }}
                style={{
                  padding: '12px 18px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'none',
                  border: 'none',
                  borderBottom: createTab === 'CURRICULUM' ? '2px solid #1c2d81' : '2px solid transparent',
                  color: createTab === 'CURRICULUM' ? '#1c2d81' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <BookOpen size={14} color={createTab === 'CURRICULUM' ? '#1c2d81' : '#94a3b8'} />
                <span>
                  2. Course Curriculum ({createChapters.length} {createChapters.length === 1 ? 'Chapter' : 'Chapters'})
                </span>
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={submitCreateSkill}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
                margin: 0,
              }}
            >
              <div
                style={{
                  padding: '20px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {createTab === 'DETAILS' ? (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Skill Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Apache Kafka, Next.js, Kubernetes"
                        value={createForm.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.86rem',
                          fontFamily: 'inherit',
                          borderRadius: '3px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Canonical Slug *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., apache-kafka"
                          value={createForm.slug}
                          onChange={(e) => setCreateForm((prev) => ({ ...prev, slug: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.86rem',
                            fontFamily: 'inherit',
                            borderRadius: '3px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Domain Category *
                        </label>
                        <select
                          required
                          value={createForm.categoryId}
                          onChange={(e) => setCreateForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.86rem',
                            fontFamily: 'inherit',
                            borderRadius: '3px',
                            background: '#ffffff',
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="" disabled>Select Domain...</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Market Demand
                        </label>
                        <select
                          value={createForm.demand}
                          onChange={(e) => setCreateForm((prev) => ({ ...prev, demand: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.86rem',
                            fontFamily: 'inherit',
                            borderRadius: '3px',
                            background: '#ffffff',
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="HIGH">HIGH DEMAND</option>
                          <option value="MEDIUM">MEDIUM DEMAND</option>
                          <option value="LOW">EMERGING</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Salary Benchmark
                        </label>
                        <input
                          type="text"
                          value={createForm.salary}
                          onChange={(e) => setCreateForm((prev) => ({ ...prev, salary: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.86rem',
                            fontFamily: 'inherit',
                            borderRadius: '3px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Description &amp; Competency Scope
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Outline competency requirements, core architectural standards, and assessment criteria..."
                        value={createForm.description}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.86rem',
                          fontFamily: 'inherit',
                          borderRadius: '3px',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Quick Callout to Curriculum Tab */}
                    <div
                      style={{
                        background: '#eff6ff',
                        border: '1px dashed #bfdbfe',
                        padding: '12px 16px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '4px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                          Online Learning Course Chapters
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                          {createChapters.length > 0
                            ? `Configured with ${createChapters.length} chapters and ${createChapters.reduce((acc, c) => acc + (c.lessons?.length || 0), 0)} interactive lessons.`
                            : 'Set up learning chapters & lessons so students can study this skill on the platform.'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (createChapters.length === 0 && createForm.name.trim()) {
                            handleAutoGenerateCurriculum(createForm.name);
                          }
                          setCreateTab('CURRICULUM');
                        }}
                        style={{
                          background: '#1c2d81',
                          color: '#fed601',
                          border: 'none',
                          padding: '7px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          borderRadius: '3px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span>{createChapters.length > 0 ? 'Edit Chapters' : 'Configure Chapters'}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </>
                ) : (
                  /* CURRICULUM BUILDER TAB */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '12px 16px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase' }}>
                          Syllabus Architecture for {createForm.name || 'New Skill'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                          {createChapters.length} Chapters &bull; {createChapters.reduce((acc, c) => acc + (c.lessons?.length || 0), 0)} Lessons
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleAutoGenerateCurriculum(createForm.name)}
                          style={{
                            background: '#fef9c3',
                            border: '1px solid #fde047',
                            color: '#854d0e',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '3px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Sparkles size={14} color="#ca8a04" />
                          <span>⚡ Auto-Generate Blueprint</span>
                        </button>

                        <button
                          type="button"
                          onClick={addCreateChapter}
                          style={{
                            background: '#1c2d81',
                            border: '1px solid #1c2d81',
                            color: '#fed601',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            borderRadius: '3px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Plus size={14} />
                          <span>+ Add Chapter</span>
                        </button>
                      </div>
                    </div>

                    {createChapters.length === 0 ? (
                      <div
                        style={{
                          padding: '36px 20px',
                          textAlign: 'center',
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '4px',
                        }}
                      >
                        <BookOpen size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                        <h4 style={{ margin: '0 0 6px', fontSize: '0.96rem', fontWeight: 800, color: '#1c2d81' }}>
                          No Chapters Configured Yet
                        </h4>
                        <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748b', maxWidth: '440px', marginInline: 'auto' }}>
                          Generate an enterprise standard 3-tier course track with 9 interactive lessons tailored for {createForm.name || 'this competency'}, or build custom chapters manually.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAutoGenerateCurriculum(createForm.name)}
                          style={{
                            background: '#1c2d81',
                            color: '#fed601',
                            border: 'none',
                            padding: '8px 18px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            borderRadius: '3px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Wand2 size={15} />
                          <span>⚡ Auto-Generate Standard Course Blueprint</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {createChapters.map((chapter, cIdx) => (
                          <div
                            key={cIdx}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                background: '#f1f5f9',
                                padding: '10px 14px',
                                borderBottom: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '10px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                <span
                                  style={{
                                    background: '#1c2d81',
                                    color: '#ffffff',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '3px 8px',
                                    borderRadius: '2px',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  CH {cIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  required
                                  value={chapter.name}
                                  onChange={(e) => updateCreateChapter(cIdx, 'name', e.target.value)}
                                  placeholder="Chapter Title"
                                  style={{
                                    flex: 1,
                                    padding: '5px 8px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '2px',
                                    fontSize: '0.84rem',
                                    fontWeight: 700,
                                    color: '#1c2d81',
                                  }}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => removeCreateChapter(cIdx)}
                                title="Delete Chapter"
                                style={{
                                  background: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  color: '#b91c1c',
                                  padding: '4px 8px',
                                  borderRadius: '2px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                }}
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>

                            <div style={{ padding: '12px 14px' }}>
                              <div style={{ marginBottom: '10px' }}>
                                <input
                                  type="text"
                                  value={chapter.description || ''}
                                  onChange={(e) => updateCreateChapter(cIdx, 'description', e.target.value)}
                                  placeholder="Chapter overview &amp; competency description..."
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '2px',
                                    fontSize: '0.78rem',
                                    color: '#475569',
                                    boxSizing: 'border-box',
                                  }}
                                />
                              </div>

                              <div style={{ paddingLeft: '12px', borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Lessons ({chapter.lessons?.length || 0})</span>
                                  <button
                                    type="button"
                                    onClick={() => addCreateLesson(cIdx)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#1d4ed8',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: 0,
                                    }}
                                  >
                                    <Plus size={12} />
                                    <span>Add Lesson</span>
                                  </button>
                                </div>

                                {(chapter.lessons || []).map((lesson, lIdx) => (
                                  <div
                                    key={lIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      padding: '6px 10px',
                                      borderRadius: '3px',
                                    }}
                                  >
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', minWidth: '24px' }}>
                                      {cIdx + 1}.{lIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      required
                                      value={lesson.name}
                                      onChange={(e) => updateCreateLesson(cIdx, lIdx, 'name', e.target.value)}
                                      placeholder="Lesson Title"
                                      style={{
                                        flex: 1,
                                        padding: '4px 8px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '2px',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        color: '#1e293b',
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={lesson.description || ''}
                                      onChange={(e) => updateCreateLesson(cIdx, lIdx, 'description', e.target.value)}
                                      placeholder="Brief lesson description..."
                                      style={{
                                        flex: 1,
                                        padding: '4px 8px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '2px',
                                        fontSize: '0.76rem',
                                        color: '#64748b',
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeCreateLesson(cIdx, lIdx)}
                                      title="Remove Lesson"
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        padding: '3px',
                                        display: 'flex',
                                      }}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#ffffff',
                }}
              >
                <div>
                  {createTab === 'CURRICULUM' ? (
                    <button
                      type="button"
                      onClick={() => setCreateTab('DETAILS')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1c2d81',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: 0,
                      }}
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Details</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (createChapters.length === 0 && createForm.name.trim()) {
                          handleAutoGenerateCurriculum(createForm.name);
                        }
                        setCreateTab('CURRICULUM');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1d4ed8',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: 0,
                      }}
                    >
                      <span>Configure Curriculum ({createChapters.length} Chapters)</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                      borderRadius: '3px',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCreate}
                    style={{
                      background: '#1c2d81',
                      border: '1px solid #1c2d81',
                      color: '#fed601',
                      padding: '8px 20px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      borderRadius: '3px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {submittingCreate ? (
                      <>
                        <RefreshCw size={14} className="spin" />
                        <span>Creating Course Track...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={15} />
                        <span>
                          {createChapters.length > 0
                            ? `Create Course Track (${createChapters.length} Chapters)`
                            : 'Create Skill'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SKILL MODAL */}
      {skillToEdit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setSkillToEdit(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #1c2d81',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              borderRadius: '2px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: '#1c2d81',
                color: '#ffffff',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} color="#fed601" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  Edit Skill: {skillToEdit.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSkillToEdit(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitEditSkill} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    fontFamily: 'inherit',
                    borderRadius: '3px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Canonical Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.slug}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      fontFamily: 'inherit',
                      borderRadius: '3px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Domain Category
                  </label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                      fontFamily: 'inherit',
                      borderRadius: '3px',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    fontFamily: 'inherit',
                    borderRadius: '3px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSkillToEdit(null)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'pointer', borderRadius: '3px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  style={{ background: '#1c2d81', border: '1px solid #1c2d81', color: '#fed601', padding: '8px 18px', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer', borderRadius: '3px' }}
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {skillToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setSkillToDelete(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #dc2626',
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
              borderRadius: '2px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                Confirm Skill Deletion
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to delete <strong>{skillToDelete.name}</strong> from the taxonomy registry? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSkillToDelete(null)}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'pointer', borderRadius: '3px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={submitDeleteSkill}
                style={{ background: '#dc2626', border: '1px solid #dc2626', color: '#ffffff', padding: '8px 18px', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer', borderRadius: '3px' }}
              >
                {deleting ? 'Deleting...' : 'Delete Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NODE INSPECTION MODAL */}
      {inspectNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setInspectNode(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #1c2d81',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              borderRadius: '2px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: '#1c2d81',
                color: '#ffffff',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderTree size={18} color="#fed601" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  {inspectNode.type === 'CATEGORY' ? 'Knowledge Domain Node' : 'Competency Node Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectNode(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  NODE NAME
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1c2d81', marginTop: '2px' }}>
                  {inspectNode.item.name}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px 16px',
                  borderRadius: '2px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>CANONICAL SLUG</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', marginTop: '2px' }}>
                    <code>{inspectNode.item.slug}</code>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>HIERARCHY LEVEL</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', marginTop: '2px' }}>
                    {inspectNode.type}
                  </div>
                </div>
                {inspectNode.domainName && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>PARENT DOMAIN</div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c2d81', marginTop: '2px' }}>
                      {inspectNode.domainName}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>INDUSTRY DEMAND</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                    HIGH (+24% YoY)
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  DESCRIPTION
                </div>
                <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, marginTop: '4px' }}>
                  {inspectNode.item.description || 'Standardized curriculum competency benchmarked against enterprise technical requirements.'}
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setInspectNode(null)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'pointer', borderRadius: '3px' }}
                >
                  Close
                </button>
                {inspectNode.type === 'SKILL' && (
                  <Link
                    to={`/admin/questions?search=${encodeURIComponent(inspectNode.item.name)}`}
                    style={{
                      background: '#1c2d81',
                      border: '1px solid #1c2d81',
                      color: '#fed601',
                      padding: '8px 18px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '3px',
                    }}
                  >
                    <HelpCircle size={14} />
                    <span>View in Question Bank</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COURSE & CURRICULUM MANAGER MODAL */}
      {activeCurriculumSkill && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => {
            setActiveCurriculumSkill(null);
            setEditingChapter(null);
            setEditingLesson(null);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #1c2d81',
              width: '100%',
              maxWidth: '880px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: '#1c2d81',
                color: '#ffffff',
                padding: '16px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={22} color="#fed601" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                    Course Curriculum &amp; Syllabus Manager
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#93c5fd', marginTop: '2px' }}>
                    {activeCurriculumSkill.name} &bull; {activeCurriculumSkill.category || 'Competency Track'} &bull; <code>{activeCurriculumSkill.slug}</code>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => refreshCurriculum(activeCurriculumSkill.id)}
                  title="Reload syllabus"
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    padding: '5px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <RefreshCw size={14} className={loadingCurriculum ? 'spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCurriculumSkill(null);
                    setEditingChapter(null);
                    setEditingLesson(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Platform Metrics Bar & Student Experience Link */}
            <div
              style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '12px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Chapters
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1c2d81' }}>
                    {curriculumData?.totalChapters ?? (loadingCurriculum ? '...' : 0)}
                  </div>
                </div>

                <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} />

                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Interactive Lessons
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1c2d81' }}>
                    {curriculumData?.totalLessons ?? (loadingCurriculum ? '...' : 0)}
                  </div>
                </div>

                <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} />

                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Enrolled Students
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={15} />
                    <span>{curriculumData?.enrolledStudents ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={`/student/skills/${activeCurriculumSkill.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open Student Online Learning Platform View"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    padding: '7px 12px',
                    borderRadius: '3px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <GraduationCap size={15} />
                  <span>Student Learning Platform ↗</span>
                </a>

                <button
                  type="button"
                  onClick={() =>
                    setEditingChapter({
                      name: '',
                      slug: '',
                      description: '',
                      displayOrder: (curriculumData?.chapters?.length || 0) + 1,
                    })
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#1c2d81',
                    color: '#fed601',
                    border: '1px solid #1c2d81',
                    padding: '7px 14px',
                    borderRadius: '3px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>+ Add Chapter</span>
                </button>
              </div>
            </div>

            {/* Scrollable Syllabus Hierarchy Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: '#ffffff',
              }}
            >
              {loadingCurriculum ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', color: '#1c2d81' }} />
                  <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                    Loading syllabus &amp; enrollment structure...
                  </div>
                </div>
              ) : !curriculumData?.chapters || curriculumData.chapters.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '4px',
                  }}
                >
                  <BookOpen size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#1c2d81' }}>
                    No Chapters or Lessons Yet
                  </h4>
                  <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b', maxWidth: '420px', marginInline: 'auto' }}>
                    Configure the learning modules so students can study this competency online and prepare for proctored assessments.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingChapter({
                        name: 'Chapter 1: Foundations & Architecture',
                        slug: 'chapter-1-foundations',
                        description: `Foundations and prerequisites for ${activeCurriculumSkill.name}.`,
                        displayOrder: 1,
                      })
                    }
                    style={{
                      background: '#1c2d81',
                      color: '#fed601',
                      border: 'none',
                      padding: '8px 18px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      borderRadius: '3px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Plus size={14} />
                    <span>Create Chapter 1</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {curriculumData.chapters.map((chapter, idx) => {
                    const chId = chapter.id || String(idx);
                    const isExpanded = expandedChapters[chId] !== false;
                    return (
                      <div
                        key={chId}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: '#ffffff',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        {/* Chapter Row */}
                        <div
                          style={{
                            background: '#f8fafc',
                            padding: '12px 16px',
                            borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}
                            onClick={() => toggleChapterExpand(chId)}
                          >
                            <button
                              type="button"
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                color: '#64748b',
                                display: 'flex',
                              }}
                            >
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>

                            <span
                              style={{
                                background: '#1c2d81',
                                color: '#ffffff',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '2px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              CH {chapter.displayOrder || idx + 1}
                            </span>

                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1c2d81' }}>
                                {chapter.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
                                <code>{chapter.slug}</code> &bull; {chapter.lessons?.length || 0} Lessons
                              </div>
                            </div>
                          </div>

                          {/* Chapter Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingLesson({
                                  topicId: chapter.id!,
                                  name: '',
                                  slug: '',
                                  description: '',
                                  displayOrder: (chapter.lessons?.length || 0) + 1,
                                })
                              }
                              title="Add Lesson to this chapter"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                borderRadius: '2px',
                                cursor: 'pointer',
                              }}
                            >
                              <Plus size={12} />
                              <span>Add Lesson</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingChapter({
                                  chapterId: chapter.id,
                                  name: chapter.name,
                                  slug: chapter.slug || '',
                                  description: chapter.description || '',
                                  displayOrder: chapter.displayOrder || idx + 1,
                                })
                              }
                              title="Edit chapter title/scope"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                borderRadius: '2px',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteChapter(chapter.id!, chapter.name)}
                              title="Delete chapter and lessons"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#ffffff',
                                border: '1px solid #fee2e2',
                                color: '#ef4444',
                                width: '26px',
                                height: '26px',
                                padding: 0,
                                borderRadius: '2px',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Chapter Expanded Content: Description & Nested Lessons */}
                        {isExpanded && (
                          <div style={{ padding: '14px 16px', background: '#ffffff' }}>
                            {chapter.description && (
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#475569',
                                  background: '#f8fafc',
                                  borderLeft: '3px solid #1c2d81',
                                  padding: '8px 12px',
                                  marginBottom: '12px',
                                  borderRadius: '0 2px 2px 0',
                                }}
                              >
                                {chapter.description}
                              </div>
                            )}

                            {/* Nested Lessons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {!chapter.lessons || chapter.lessons.length === 0 ? (
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', padding: '6px 0' }}>
                                  No lessons added to this chapter yet. Click "+ Add Lesson" above.
                                </div>
                              ) : (
                                chapter.lessons.map((lesson, lIdx) => (
                                  <div
                                    key={lesson.id || lIdx}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      background: '#ffffff',
                                      border: '1px solid #f1f5f9',
                                      padding: '8px 12px',
                                      borderRadius: '3px',
                                      transition: 'background 0.1s ease',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span
                                        style={{
                                          fontSize: '0.72rem',
                                          fontWeight: 800,
                                          color: '#64748b',
                                          background: '#f1f5f9',
                                          padding: '2px 6px',
                                          borderRadius: '2px',
                                          minWidth: '32px',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {(chapter.displayOrder || idx + 1)}.{lesson.displayOrder || lIdx + 1}
                                      </span>

                                      <FileText size={15} color="#1c2d81" />

                                      <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                                          {lesson.name}
                                        </div>
                                        {lesson.description && (
                                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
                                            {lesson.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Lesson Actions */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingLesson({
                                            lessonId: lesson.id,
                                            topicId: chapter.id!,
                                            name: lesson.name,
                                            slug: lesson.slug || '',
                                            description: lesson.description || '',
                                            displayOrder: lesson.displayOrder || lIdx + 1,
                                          })
                                        }
                                        title="Edit lesson details"
                                        style={{
                                          background: 'none',
                                          border: '1px solid #e2e8f0',
                                          color: '#64748b',
                                          padding: '3px 6px',
                                          borderRadius: '2px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <Edit2 size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLesson(lesson.id!, lesson.name)}
                                        title="Delete lesson"
                                        style={{
                                          background: 'none',
                                          border: '1px solid #fee2e2',
                                          color: '#ef4444',
                                          padding: '3px 6px',
                                          borderRadius: '2px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                padding: '14px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#ffffff',
              }}
            >
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Online learning syllabus connects dynamically with student dashboard and chapter assessments.
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveCurriculumSkill(null);
                  setEditingChapter(null);
                  setEditingLesson(null);
                }}
                style={{
                  background: '#1c2d81',
                  color: '#ffffff',
                  border: '1px solid #1c2d81',
                  padding: '8px 20px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  borderRadius: '3px',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CHAPTER */}
      {editingChapter && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
          onClick={() => setEditingChapter(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #1c2d81',
              width: '100%',
              maxWidth: '520px',
              borderRadius: '3px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: '#1c2d81',
                color: '#ffffff',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                {editingChapter.chapterId ? 'Edit Chapter' : 'Add New Chapter to Syllabus'}
              </h4>
              <button
                type="button"
                onClick={() => setEditingChapter(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Chapter 1: Core Fundamentals & Syntax"
                  value={editingChapter.name}
                  onChange={(e) =>
                    setEditingChapter((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: e.target.value,
                            slug: prev.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                          }
                        : null
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    borderRadius: '2px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Slug
                  </label>
                  <input
                    type="text"
                    value={editingChapter.slug}
                    onChange={(e) =>
                      setEditingChapter((prev) => (prev ? { ...prev, slug: e.target.value } : null))
                    }
                    placeholder="chapter-1-core"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      borderRadius: '2px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingChapter.displayOrder}
                    onChange={(e) =>
                      setEditingChapter((prev) =>
                        prev ? { ...prev, displayOrder: parseInt(e.target.value) || 1 } : null
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      borderRadius: '2px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Chapter Overview &amp; Learning Objectives
                </label>
                <textarea
                  rows={3}
                  value={editingChapter.description}
                  onChange={(e) =>
                    setEditingChapter((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  placeholder="Outline competency coverage, skills attained, and prerequisites..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    borderRadius: '2px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingChapter(null)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#475569',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingChapter}
                  style={{
                    background: '#1c2d81',
                    color: '#fed601',
                    border: '1px solid #1c2d81',
                    padding: '6px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  {submittingChapter ? 'Saving...' : 'Save Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT LESSON */}
      {editingLesson && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
          onClick={() => setEditingLesson(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #1c2d81',
              width: '100%',
              maxWidth: '520px',
              borderRadius: '3px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: '#1c2d81',
                color: '#ffffff',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                {editingLesson.lessonId ? 'Edit Interactive Lesson' : 'Add Lesson to Chapter'}
              </h4>
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Lesson 1.1: Runtime Architecture & Memory Bounds"
                  value={editingLesson.name}
                  onChange={(e) =>
                    setEditingLesson((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: e.target.value,
                            slug: prev.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                          }
                        : null
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    borderRadius: '2px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Slug
                  </label>
                  <input
                    type="text"
                    value={editingLesson.slug}
                    onChange={(e) =>
                      setEditingLesson((prev) => (prev ? { ...prev, slug: e.target.value } : null))
                    }
                    placeholder="lesson-runtime-architecture"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      borderRadius: '2px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingLesson.displayOrder}
                    onChange={(e) =>
                      setEditingLesson((prev) =>
                        prev ? { ...prev, displayOrder: parseInt(e.target.value) || 1 } : null
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      borderRadius: '2px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#1c2d81', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Lesson Summary &amp; Exercises
                </label>
                <textarea
                  rows={3}
                  value={editingLesson.description}
                  onChange={(e) =>
                    setEditingLesson((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  placeholder="Outline key lesson takeaways, coding exercises, and checkpoints..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    borderRadius: '2px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#475569',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLesson}
                  style={{
                    background: '#1c2d81',
                    color: '#fed601',
                    border: '1px solid #1c2d81',
                    padding: '6px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  {submittingLesson ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
