import React, { useState, useEffect } from 'react';
import api from '../api';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const ManageHome = () => {
  const [data, setData] = useState({
    hero: { title: '', subtitle: '', description: '', ctaText: '' },
    about: { title: '', subtitle: '', content: [''] },
    services: { title: '', items: [] },
    projects: { title: '', subtitle: '', items: [] },
    features: { title: '', subtitle: '', items: [] },
    stats: { title: '', items: [] }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/home');
        if (response.data) {
          setData(response.data);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Failed to fetch home data", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.put('/home', data);
      setMessage('Home page data saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-gold-500" size={48} /></div>;

  return (
    <div className="p-10 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0a0f1a]">Manage Home Page</h1>
          <p className="text-gray-500 mt-2">Update the text and images displayed on your landing page.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#0a0f1a] text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-8 rounded-xl ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Hero Section Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#0a0f1a]">Hero Section</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input 
              type="text" 
              value={data.hero?.subtitle || ''} 
              onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              value={data.hero?.title || ''} 
              onChange={(e) => handleChange('hero', 'title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows="4"
              value={data.hero?.description || ''} 
              onChange={(e) => handleChange('hero', 'description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-[#0a0f1a] mb-3">Primary Button</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Text</label>
                  <input type="text" value={data.hero?.cta?.primary?.text || ''} onChange={(e) => handleChange('hero', 'cta', { ...data.hero?.cta, primary: { ...data.hero?.cta?.primary, text: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Link URL</label>
                  <input type="text" value={data.hero?.cta?.primary?.link || ''} onChange={(e) => handleChange('hero', 'cta', { ...data.hero?.cta, primary: { ...data.hero?.cta?.primary, link: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-[#0a0f1a] mb-3">Secondary Button</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Text</label>
                  <input type="text" value={data.hero?.cta?.secondary?.text || ''} onChange={(e) => handleChange('hero', 'cta', { ...data.hero?.cta, secondary: { ...data.hero?.cta?.secondary, text: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Link URL</label>
                  <input type="text" value={data.hero?.cta?.secondary?.link || ''} onChange={(e) => handleChange('hero', 'cta', { ...data.hero?.cta, secondary: { ...data.hero?.cta?.secondary, link: e.target.value } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section Form (Simplified for now) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#0a0f1a]">About Section</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              value={data.about?.title || ''} 
              onChange={(e) => handleChange('about', 'title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input 
              type="text" 
              value={data.about?.subtitle || ''} 
              onChange={(e) => handleChange('about', 'subtitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none transition-all"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1 mt-4">
              <label className="block text-sm font-medium text-gray-700">Paragraphs (Content)</label>
              <button type="button" onClick={() => addArrayItem('about', '')} className="text-sm text-gold-600 hover:text-gold-700 font-medium">+ Add Paragraph</button>
            </div>
            <div className="space-y-3 mb-6">
              {(data.about?.content || []).map((paragraph, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea 
                    rows="3"
                    value={paragraph || ''} 
                    onChange={(e) => {
                      const newContent = [...(data.about.content || [])];
                      newContent[idx] = e.target.value;
                      handleChange('about', 'content', newContent);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                  />
                  <button type="button" onClick={() => {
                    const newContent = [...(data.about.content || [])];
                    newContent.splice(idx, 1);
                    handleChange('about', 'content', newContent);
                  }} className="text-red-500 hover:text-red-700 px-2">
                    <Trash2 size={20}/>
                  </button>
                </div>
              ))}
            </div>
            
            <ImageUpload 
              label="About Section Image"
              folder="home"
              value={data.about?.image || ''} 
              onChange={(url) => handleChange('about', 'image', url)} 
            />
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0a0f1a]">Services</h2>
          <button type="button" onClick={() => addArrayItem('services', { title: '', description: '', icon: 'MapPin', image: '' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600 transition-colors">
            <Plus size={16} /> Add Service
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Title</label>
              <input type="text" value={data.services?.title || ''} onChange={(e) => handleChange('services', 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Description</label>
              <textarea rows="2" value={data.services?.description || ''} onChange={(e) => handleChange('services', 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CTA Button Text</label>
              <input type="text" value={data.services?.cta?.text || ''} onChange={(e) => handleChange('services', 'cta', { ...data.services?.cta, text: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CTA Button Link</label>
              <input type="text" value={data.services?.cta?.link || ''} onChange={(e) => handleChange('services', 'cta', { ...data.services?.cta, link: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
          </div>
          
          <h3 className="font-bold text-gray-700 mt-6 border-b pb-2">Service Cards</h3>
          {(data.services?.items || []).map((item, idx) => (
            <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50">
              <button type="button" onClick={() => removeArrayItem('services', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={16}/></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Service Title</label>
                  <input type="text" value={item.title || ''} onChange={(e) => handleArrayChange('services', idx, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Icon Name (Lucide)</label>
                  <input type="text" value={item.icon || ''} onChange={(e) => handleArrayChange('services', idx, 'icon', e.target.value)} placeholder="e.g. MapPin, Home, Key" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <ImageUpload 
                    label="Background Image"
                    folder="home"
                    value={item.image || ''} 
                    onChange={(url) => handleArrayChange('services', idx, 'image', url)} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <input type="text" value={item.description || ''} onChange={(e) => handleArrayChange('services', idx, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Projects Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0a0f1a]">Featured Projects List</h2>
          <button type="button" onClick={() => addArrayItem('projects', { name: '', status: '', location: '' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600 transition-colors">
            <Plus size={16} /> Add Project
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pill Text</label>
              <input type="text" value={data.projects?.pillText || ''} onChange={(e) => handleChange('projects', 'pillText', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Main Heading</label>
              <input type="text" value={data.projects?.mainHeading || ''} onChange={(e) => handleChange('projects', 'mainHeading', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Subtitle</label>
              <input type="text" value={data.projects?.subtitle || ''} onChange={(e) => handleChange('projects', 'subtitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Lower Heading</label>
              <input type="text" value={data.projects?.title || ''} onChange={(e) => handleChange('projects', 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
          </div>
          {(data.projects?.items || []).map((item, idx) => (
            <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50 pr-12">
              <button type="button" onClick={() => removeArrayItem('projects', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={16}/></button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Project Name</label>
                  <input type="text" value={item.name || ''} onChange={(e) => handleArrayChange('projects', idx, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status (e.g. Sold Out)</label>
                  <input type="text" value={item.status || ''} onChange={(e) => handleArrayChange('projects', idx, 'status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                  <input type="text" value={item.location || ''} onChange={(e) => handleArrayChange('projects', idx, 'location', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
                </div>
              </div>
              <ImageUpload 
                label="Project Image"
                folder="home"
                value={item.image || ''} 
                onChange={(url) => handleArrayChange('projects', idx, 'image', url)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0a0f1a]">Features</h2>
          <button type="button" onClick={() => addArrayItem('features', { title: '', description: '', icon: 'BookOpen' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600 transition-colors">
            <Plus size={16} /> Add Feature
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Title</label>
              <input type="text" value={data.features?.title || ''} onChange={(e) => handleChange('features', 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Subtitle</label>
              <input type="text" value={data.features?.subtitle || ''} onChange={(e) => handleChange('features', 'subtitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CTA Button Text</label>
              <input type="text" value={data.features?.cta?.text || ''} onChange={(e) => handleChange('features', 'cta', { ...data.features?.cta, text: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CTA Button Link</label>
              <input type="text" value={data.features?.cta?.link || ''} onChange={(e) => handleChange('features', 'cta', { ...data.features?.cta, link: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
          </div>
          
          {(data.features?.items || []).map((item, idx) => (
            <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50">
              <button type="button" onClick={() => removeArrayItem('features', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={16}/></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Feature Title</label>
                  <input type="text" value={item.title || ''} onChange={(e) => handleArrayChange('features', idx, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Icon Name (Lucide)</label>
                  <input type="text" value={item.icon || ''} onChange={(e) => handleArrayChange('features', idx, 'icon', e.target.value)} placeholder="e.g. BookOpen, ShieldCheck" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <input type="text" value={item.description || ''} onChange={(e) => handleArrayChange('features', idx, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0a0f1a]">Journey Stats</h2>
          <button type="button" onClick={() => addArrayItem('stats', { value: '', label: '' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600 transition-colors">
            <Plus size={16} /> Add Stat
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Title (use {'<br />'} for breaks)</label>
              <input type="text" value={data.stats?.title || ''} onChange={(e) => handleChange('stats', 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Subtitle</label>
              <input type="text" value={data.stats?.subtitle || ''} onChange={(e) => handleChange('stats', 'subtitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div className="md:col-span-2">
              <ImageUpload 
                label="Background Image"
                folder="home"
                value={data.stats?.image || ''} 
                onChange={(url) => handleChange('stats', 'image', url)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.stats?.items || []).map((item, idx) => (
              <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex gap-4 pr-12">
                <button type="button" onClick={() => removeArrayItem('stats', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={16}/></button>
                <div className="w-1/3">
                  <input type="text" placeholder="Value" value={item.value || ''} onChange={(e) => handleArrayChange('stats', idx, 'value', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none font-bold" />
                </div>
                <div className="w-2/3">
                  <input type="text" placeholder="Label" value={item.label || ''} onChange={(e) => handleArrayChange('stats', idx, 'label', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0a0f1a]">Testimonials</h2>
          <button type="button" onClick={() => addArrayItem('testimonials', { name: '', location: '', review: '', color: 'bg-teal-500', initial: '' })} className="flex items-center gap-1 text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600 transition-colors">
            <Plus size={16} /> Add Testimonial
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Title</label>
              <input type="text" value={data.testimonials?.title || ''} onChange={(e) => handleChange('testimonials', 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Subtitle</label>
              <input type="text" value={data.testimonials?.subtitle || ''} onChange={(e) => handleChange('testimonials', 'subtitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
          </div>
          
          {(data.testimonials?.items || []).map((item, idx) => (
            <div key={idx} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50">
              <button type="button" onClick={() => removeArrayItem('testimonials', idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={16}/></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Name</label>
                  <input type="text" value={item.name || ''} onChange={(e) => {
                    handleArrayChange('testimonials', idx, 'name', e.target.value);
                    handleArrayChange('testimonials', idx, 'initial', e.target.value.charAt(0).toUpperCase());
                  }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location / Tagline</label>
                  <input type="text" value={item.location || ''} onChange={(e) => handleArrayChange('testimonials', idx, 'location', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Review Content</label>
                  <textarea rows="3" value={item.review || ''} onChange={(e) => handleArrayChange('testimonials', idx, 'review', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageHome;
