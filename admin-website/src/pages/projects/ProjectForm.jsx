import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { Save, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

const ProjectForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(slug);

  const [data, setData] = useState({
    slug: '',
    hero: { title: '', image: '' },
    overview: { logo: '', tagline: '', rera: '', subtitle: '', description: '' },
    banner: { image: '' },
    fixedBanner: { image: '' },
    location: { title: 'Location Advantage', mapUrl: '' }
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchProject = async () => {
        try {
          const response = await api.get(`/projects/${slug}`);
          setData(response.data);
        } catch (err) {
          setError('Failed to fetch project details');
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [slug, isEditMode]);

  const handleChange = (section, field, value) => {
    if (!section) {
      setData(prev => ({ ...prev, [field]: value }));
    } else {
      setData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const handleArrayChange = (section, index, field, value) => {
    setData(prev => {
      const newItems = [...(prev[section].items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return {
        ...prev,
        [section]: { ...prev[section], items: newItems }
      };
    });
  };

  const addArrayItem = (section, defaultItem) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: [...(prev[section].items || []), defaultItem]
      }
    }));
  };

  const removeArrayItem = (section, index) => {
    setData(prev => {
      const newItems = [...(prev[section].items || [])];
      newItems.splice(index, 1);
      return {
        ...prev,
        [section]: { ...prev[section], items: newItems }
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEditMode) {
        await api.put(`/projects/${slug}`, data);
      } else {
        await api.post('/projects', data);
      }
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500" size={48} /></div>;

  return (
    <div className="p-10 max-w-4xl mx-auto pb-32">
      <Link to="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-medium">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0a0f1a]">{isEditMode ? 'Edit Project' : 'Create New Project'}</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#0a0f1a] text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Project'}
        </button>
      </div>

      {error && <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Basic Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug (must be unique, e.g., 'royal-heights')</label>
              <input 
                required
                type="text" 
                value={data.slug} 
                onChange={(e) => handleChange(null, 'slug', e.target.value.toLowerCase().replace(/ /g, '-'))}
                disabled={isEditMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-gold-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name (Hero Title)</label>
              <input 
                required
                type="text" 
                value={data.hero?.title || ''} 
                onChange={(e) => handleChange('hero', 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
              />
            </div>
            <div>
              <ImageUpload 
                label="Hero Background Image"
                folder="projects"
                value={data.hero?.image || ''} 
                onChange={(url) => handleChange('hero', 'image', url)} 
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Nav array) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Page Navigation Menu</h2>
            <button type="button" onClick={() => {
               const newNav = [...(data.nav || []), { label: '', link: '' }];
               handleChange(null, 'nav', newNav);
            }} className="flex items-center gap-1 text-sm text-gold-600 font-medium">
              + Add Nav Item
            </button>
          </div>
          <div className="p-6 space-y-3">
            {(data.nav || []).map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" placeholder="Label (e.g. Overview)" value={item.label || (typeof item === 'string' ? item : '')} onChange={(e) => {
                  const newNav = [...(data.nav || [])];
                  newNav[idx] = typeof newNav[idx] === 'string' ? { label: e.target.value, link: '' } : { ...newNav[idx], label: e.target.value };
                  handleChange(null, 'nav', newNav);
                }} className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                
                <input type="text" placeholder="Link (e.g. #overview or https://...)" value={item.link || ''} onChange={(e) => {
                  const newNav = [...(data.nav || [])];
                  newNav[idx] = typeof newNav[idx] === 'string' ? { label: newNav[idx], link: e.target.value } : { ...newNav[idx], link: e.target.value };
                  handleChange(null, 'nav', newNav);
                }} className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                
                <button type="button" onClick={() => {
                  const newNav = [...(data.nav || [])];
                  newNav.splice(idx, 1);
                  handleChange(null, 'nav', newNav);
                }} className="text-red-500 p-2"><Trash2 size={20}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Overview</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={data.overview?.tagline || ''} 
                  onChange={(e) => handleChange('overview', 'tagline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RERA No.</label>
                <input 
                  type="text" 
                  value={data.overview?.rera || ''} 
                  onChange={(e) => handleChange('overview', 'rera', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overview Subtitle</label>
              <input 
                type="text" 
                value={data.overview?.subtitle || ''} 
                onChange={(e) => handleChange('overview', 'subtitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                rows="5"
                value={data.overview?.description || ''} 
                onChange={(e) => handleChange('overview', 'description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold text-[#0a0f1a] mb-3">CTA Button</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Button Text</label>
                    <input type="text" value={data.overview?.cta?.text || ''} onChange={(e) => handleChange('overview', 'cta', { ...data.overview?.cta, text: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Button Link / Action</label>
                    <input type="text" value={data.overview?.cta?.link || ''} onChange={(e) => handleChange('overview', 'cta', { ...data.overview?.cta, link: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2 mt-4">
                <label className="block text-sm font-medium text-gray-700">Project Stats</label>
                <button type="button" onClick={() => {
                   const newStats = [...(data.overview?.stats || []), { value: '', label: '' }];
                   handleChange('overview', 'stats', newStats);
                }} className="text-sm text-gold-600 font-medium">+ Add Stat</button>
              </div>
              <div className="space-y-3">
                {(data.overview?.stats || []).map((stat, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" placeholder="Value (e.g. 27)" value={stat.value || ''} onChange={(e) => {
                      const newStats = [...(data.overview.stats || [])];
                      newStats[idx].value = e.target.value;
                      handleChange('overview', 'stats', newStats);
                    }} className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 font-bold" />
                    <input type="text" placeholder="Label (e.g. exclusive Farm Mansions)" value={stat.label || ''} onChange={(e) => {
                      const newStats = [...(data.overview.stats || [])];
                      newStats[idx].label = e.target.value;
                      handleChange('overview', 'stats', newStats);
                    }} className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                    <button type="button" onClick={() => {
                      const newStats = [...(data.overview.stats || [])];
                      newStats.splice(idx, 1);
                      handleChange('overview', 'stats', newStats);
                    }} className="text-red-500 p-2"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Single Image Banners */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Large Banners</h2>
          </div>
          <div className="p-6 space-y-8">
            <div>
              <ImageUpload 
                label="Standard Banner Image"
                folder="projects"
                value={data.banner?.image || ''} 
                onChange={(url) => handleChange('banner', 'image', url)} 
              />
            </div>
            <div>
              <ImageUpload 
                label="Fixed/Parallax Banner Image"
                folder="projects"
                value={data.fixedBanner?.image || ''} 
                onChange={(url) => handleChange('fixedBanner', 'image', url)} 
              />
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Gallery</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input type="text" value={data.gallery?.title || ''} onChange={(e) => handleChange('gallery', 'title', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 mb-4" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Image URLs</label>
                <button type="button" onClick={() => {
                   const newImages = [...(data.gallery?.images || []), { url: '', category: '' }];
                   handleChange('gallery', 'images', newImages);
                }} className="text-sm text-gold-600 font-medium">+ Add Image</button>
              </div>
              <div className="space-y-6">
                {(data.gallery?.images || []).map((img, idx) => (
                  <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-4">
                    <button type="button" onClick={() => {
                      const newImages = [...(data.gallery.images || [])];
                      newImages.splice(idx, 1);
                      handleChange('gallery', 'images', newImages);
                    }} className="absolute top-2 right-2 text-red-500 p-2 z-20 bg-white rounded-full shadow hover:bg-red-50"><Trash2 size={20}/></button>
                    
                    <select 
                      value={img.category || ''} 
                      onChange={(e) => {
                        const newImages = [...(data.gallery.images || [])];
                        newImages[idx] = typeof newImages[idx] === 'string' ? { url: newImages[idx], category: e.target.value } : { ...newImages[idx], category: e.target.value };
                        handleChange('gallery', 'images', newImages);
                      }} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="">Select Category...</option>
                      {(data.gallery.tabs || []).map(tab => (
                        <option key={tab} value={tab}>{tab}</option>
                      ))}
                    </select>

                    <ImageUpload 
                      label={`Gallery Image ${idx + 1}`}
                      folder="projects"
                      value={img.url || (typeof img === 'string' ? img : '')} 
                      onChange={(url) => {
                        const newImages = [...(data.gallery.images || [])];
                        newImages[idx] = typeof newImages[idx] === 'string' ? { url, category: '' } : { ...newImages[idx], url };
                        handleChange('gallery', 'images', newImages);
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Highlights</h2>
            <button type="button" onClick={() => addArrayItem('highlights', { title: '', description: '', image: '', linkText: '', linkUrl: '' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600">
              <Plus size={16} /> Add Highlight
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input type="text" value={data.highlights?.title || ''} onChange={(e) => handleChange('highlights', 'title', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            {(data.highlights?.items || []).map((item, idx) => (
              <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50 pr-10">
                <button type="button" onClick={() => removeArrayItem('highlights', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md"><Trash2 size={16}/></button>
                <div className="space-y-4">
                  <input type="text" placeholder="Title" value={item.title || ''} onChange={(e) => handleArrayChange('highlights', idx, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 font-bold" />
                  <textarea placeholder="Description" rows="3" value={item.description || ''} onChange={(e) => handleArrayChange('highlights', idx, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Link Text (e.g. Explore)" value={item.linkText || ''} onChange={(e) => handleArrayChange('highlights', idx, 'linkText', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                    <input type="text" placeholder="Link URL" value={item.linkUrl || ''} onChange={(e) => handleArrayChange('highlights', idx, 'linkUrl', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                  </div>
                  <ImageUpload 
                    label="Highlight Image"
                    folder="projects"
                    value={item.image || ''} 
                    onChange={(url) => handleArrayChange('highlights', idx, 'image', url)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Amenities</h2>
            <button type="button" onClick={() => addArrayItem('amenities', { title: '', icon: '' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600">
              <Plus size={16} /> Add Amenity
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.amenities?.items || []).map((item, idx) => (
              <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex gap-4 pr-10">
                <button type="button" onClick={() => removeArrayItem('amenities', idx)} className="absolute top-1/2 -translate-y-1/2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md"><Trash2 size={16}/></button>
                <div className="w-1/2">
                  <input type="text" placeholder="Title (e.g. Swimming Pool)" value={item.title || ''} onChange={(e) => handleArrayChange('amenities', idx, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
                <div className="w-1/2">
                  <input type="text" placeholder="Icon name" value={item.icon || ''} onChange={(e) => handleArrayChange('amenities', idx, 'icon', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Services</h2>
            <button type="button" onClick={() => addArrayItem('services', { title: '', icon: '' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600">
              <Plus size={16} /> Add Service
            </button>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input type="text" value={data.services?.title || ''} onChange={(e) => handleChange('services', 'title', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.services?.items || []).map((item, idx) => (
                <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex gap-4 pr-10">
                  <button type="button" onClick={() => removeArrayItem('services', idx)} className="absolute top-1/2 -translate-y-1/2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md"><Trash2 size={16}/></button>
                  <div className="w-1/2">
                    <input type="text" placeholder="Title" value={item.title || ''} onChange={(e) => handleArrayChange('services', idx, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                  </div>
                  <div className="w-1/2">
                    <input type="text" placeholder="Icon name" value={item.icon || ''} onChange={(e) => handleArrayChange('services', idx, 'icon', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a0f1a]">FAQs</h2>
            <button type="button" onClick={() => addArrayItem('faqs', { question: '', answer: '' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600">
              <Plus size={16} /> Add FAQ
            </button>
          </div>
          <div className="p-6 space-y-4">
            {(data.faqs?.items || []).map((item, idx) => (
              <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50 pr-10">
                <button type="button" onClick={() => removeArrayItem('faqs', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md"><Trash2 size={16}/></button>
                <div className="mb-2">
                  <input type="text" placeholder="Question" value={item.question || ''} onChange={(e) => handleArrayChange('faqs', idx, 'question', e.target.value)} className="w-full px-3 py-2 border border-gray-300 font-bold rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
                <div>
                  <textarea rows="2" placeholder="Answer" value={item.answer || ''} onChange={(e) => handleArrayChange('faqs', idx, 'answer', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Location</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={data.location?.title || ''} onChange={(e) => handleChange('location', 'title', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
              <input type="text" value={data.location?.mapUrl || ''} onChange={(e) => handleChange('location', 'mapUrl', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
          </div>
        </div>

        {/* Similar Projects Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0a0f1a]">Similar Projects</h2>
            <button type="button" onClick={() => addArrayItem('similar', { badge: '', badgeColor: '', image: '', title: '', type: '', location: '', price: '', size: '' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600">
              <Plus size={16} /> Add Similar Project
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                <input type="text" value={data.similar?.title || ''} onChange={(e) => handleChange('similar', 'title', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input type="text" value={data.similar?.linkText || ''} onChange={(e) => handleChange('similar', 'linkText', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                <input type="text" value={data.similar?.linkUrl || ''} onChange={(e) => handleChange('similar', 'linkUrl', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
              </div>
            </div>
            <div className="space-y-4">
              {(data.similar?.items || []).map((item, idx) => (
                <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50 pr-10">
                  <button type="button" onClick={() => removeArrayItem('similar', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md"><Trash2 size={16}/></button>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Title" value={item.title || ''} onChange={(e) => handleArrayChange('similar', idx, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                    <input type="text" placeholder="Type (e.g. 3 & 4 BHK)" value={item.type || ''} onChange={(e) => handleArrayChange('similar', idx, 'type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                    <input type="text" placeholder="Location" value={item.location || ''} onChange={(e) => handleArrayChange('similar', idx, 'location', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                    <input type="text" placeholder="Price" value={item.price || ''} onChange={(e) => handleArrayChange('similar', idx, 'price', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                    <input type="text" placeholder="Size" value={item.size || ''} onChange={(e) => handleArrayChange('similar', idx, 'size', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                    <input type="text" placeholder="Badge (e.g. Bookings Open)" value={item.badge || ''} onChange={(e) => handleArrayChange('similar', idx, 'badge', e.target.value)} className="w-full md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                    <div className="md:col-span-4">
                      <ImageUpload 
                        label="Project Image"
                        folder="projects"
                        value={item.image || ''} 
                        onChange={(url) => handleArrayChange('similar', idx, 'image', url)} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default ProjectForm;
