import { useState, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../common/api.js';
import { useI18n } from '../common/i18n.jsx';

const CONFIG_TABS = [
  { key: 'incomePlans', endpoint: '/admin/config/income-plans' },
  { key: 'categories', endpoint: '/admin/config/categories' },
  { key: 'geography', endpoint: '/admin/config/states' },
  { key: 'roles', endpoint: '/admin/config/roles' },
];

export default function Config() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('incomePlans');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchItems();
  }, [activeTab, page]);

  const currentTab = CONFIG_TABS.find((tb) => tb.key === activeTab);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(currentTab.endpoint, { params: { page, pageSize: 20 } });
      setItems(res.data?.data || res.data?.items || res.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load config', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await api.delete(`${currentTab.endpoint}/${id}`);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const tabLabels = {
    incomePlans: t('config.incomePlans'),
    categories: t('config.categories'),
    geography: t('config.geography'),
    roles: t('config.roles'),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-amber-600" />
        <h1 className="text-2xl font-bold text-gray-800">{t('config.title')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {CONFIG_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabLabels[tab.key]}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
        >
          <Plus size={16} />
          Add {tabLabels[activeTab]}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ConfigForm
          tab={activeTab}
          endpoint={currentTab.endpoint}
          item={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          onSuccess={() => { setShowForm(false); setEditingItem(null); fetchItems(); }}
        />
      )}

      {/* Items Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Details</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-gray-50 even:bg-gray-50 hover:bg-gray-100">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.name || item.title || item.roleName || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {getItemDetails(activeTab, item)}
                    </td>
                    <td className="px-4 py-3">
                      {item.status && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>{item.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getItemDetails(tab, item) {
  switch (tab) {
    case 'packages':
      return item.price ? `₹${Number(item.price).toLocaleString()} | BV: ${item.bv || '-'}` : '-';
    case 'incomePlans':
      return item.type ? `${item.type} | ${item.percentage || item.value || ''}%` : '-';
    case 'categories':
      return item.description || '-';
    case 'geography':
      return item.state ? `${item.state} → ${item.city || 'All Cities'}` : item.cities?.join(', ') || '-';
    case 'roles':
      return item.permissions ? `${item.permissions.length} permissions` : '-';
    default:
      return '-';
  }
}

function ConfigForm({ tab, endpoint, item, onClose, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState(getInitialForm(tab, item));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (item?.id) {
        await api.patch(`${endpoint}/${item.id}`, form);
      } else {
        await api.post(endpoint, form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {item ? 'Edit' : 'Add'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {getFormFields(tab).map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={form[field.name] || ''}
                  onChange={handleChange}
                  rows={3}
                  required={field.required}
                  className={inputCls}
                />
              ) : field.type === 'select' ? (
                <select name={field.name} value={form[field.name] || ''} onChange={handleChange} className={inputCls}>
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  type={field.type || 'text'}
                  value={form[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  className={inputCls}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
              {submitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getInitialForm(tab, item) {
  if (item) return { ...item };
  switch (tab) {
    case 'packages':
      return { name: '', price: '', bv: '', description: '', status: 'ACTIVE' };
    case 'incomePlans':
      return { name: '', type: '', percentage: '', maxCapping: '', status: 'ACTIVE' };
    case 'categories':
      return { name: '', description: '' };
    case 'geography':
      return { state: '', city: '' };
    case 'roles':
      return { name: '', permissions: '' };
    default:
      return { name: '' };
  }
}

function getFormFields(tab) {
  switch (tab) {
    case 'packages':
      return [
        { name: 'name', label: 'Package Name', required: true },
        { name: 'price', label: 'Price (₹)', type: 'number', required: true },
        { name: 'bv', label: 'Business Volume (BV)', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE'] },
      ];
    case 'incomePlans':
      return [
        { name: 'name', label: 'Plan Name', required: true },
        { name: 'type', label: 'Type', type: 'select', options: ['DIRECT', 'LEVEL', 'BINARY', 'REWARD', 'ROYALTY'] },
        { name: 'percentage', label: 'Percentage (%)', type: 'number' },
        { name: 'maxCapping', label: 'Max Capping (₹)', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE'] },
      ];
    case 'categories':
      return [
        { name: 'name', label: 'Category Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
      ];
    case 'geography':
      return [
        { name: 'state', label: 'State', required: true },
        { name: 'city', label: 'City' },
      ];
    case 'roles':
      return [
        { name: 'name', label: 'Role Name', required: true },
        { name: 'permissions', label: 'Permissions (comma separated)', type: 'textarea' },
      ];
    default:
      return [{ name: 'name', label: 'Name', required: true }];
  }
}
