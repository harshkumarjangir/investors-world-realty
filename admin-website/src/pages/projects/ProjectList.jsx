import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Plus, Edit2, Trash2, Loader2, Building2 } from 'lucide-react';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (slug) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/projects/${slug}`);
        fetchProjects(); // refresh list
      } catch (error) {
        alert("Failed to delete project");
      }
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0a0f1a]">Projects CMS</h1>
          <p className="text-gray-500 mt-2">Manage dynamic project pages on your website.</p>
        </div>
        <Link 
          to="/projects/new"
          className="flex items-center gap-2 bg-[#0a0f1a] text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Create New Project
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500" size={48} /></div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Building2 size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Projects Found</h3>
          <p className="text-gray-500 mb-6 max-w-md">You haven't created any dynamic projects yet. Click the button above to add your first project.</p>
          <Link to="/projects/new" className="text-gold-600 font-bold hover:underline">Create Project &rarr;</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 font-bold text-sm text-gray-700 uppercase tracking-wider">Project Name</th>
                <th className="px-6 py-4 font-bold text-sm text-gray-700 uppercase tracking-wider">Slug / URL</th>
                <th className="px-6 py-4 font-bold text-sm text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {project.hero?.image ? (
                        <img src={project.hero.image} alt={project.hero.title} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <Building2 size={20} />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-[#0a0f1a]">{project.hero?.title || 'Untitled Project'}</div>
                        <div className="text-sm text-gray-500">{project.overview?.subtitle || 'No subtitle'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">/projects/{project.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/projects/${project.slug}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={18} />
                      </Link>
                      <button onClick={() => handleDelete(project.slug)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
