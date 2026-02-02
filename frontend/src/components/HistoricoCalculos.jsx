import React, { useState, useEffect } from 'react';
import { History, Plus, Folder, FileText, ChevronRight, Calculator, Clock, User, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const HistoricoCalculos = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [history, setHistory] = useState({ tracao: [], tensao: [] });
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', client: '', location: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/history/projects');
      const data = await response.json();
      if (data.sucesso) {
        setProjects(data.projects);
      }
    } catch {
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/history/projects/${projectId}`);
      const data = await response.json();
      if (data.sucesso) {
        setHistory(data.history);
      }
    } catch {
      toast.error('Erro ao carregar histórico');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/history/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      const data = await response.json();
      if (data.sucesso) {
        toast.success(data.message);
        setShowNewProject(false);
        setNewProject({ name: '', description: '', client: '', location: '' });
        fetchProjects();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Erro ao criar projeto');
    }
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    fetchHistory(project.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="history-container p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <History className="text-primary" /> Histórico de Projetos
        </h2>
        <button
          className="glass-button-primary flex items-center gap-2"
          onClick={() => setShowNewProject(!showNewProject)}
        >
          <Plus size={18} /> Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Project List */}
        <div className="lg:col-span-1 space-y-4">
          {showNewProject && (
            <div className="glass-card p-4 mb-4 animate-slide-up">
              <h3 className="font-semibold mb-3">Criar Novo Projeto</h3>
              <form onSubmit={handleCreateProject} className="space-y-3">
                <input
                  className="glass-input w-full"
                  placeholder="Nome do Projeto (Obrigatório)"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
                <input
                  className="glass-input w-full"
                  placeholder="Cliente"
                  value={newProject.client}
                  onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                />
                <input
                  className="glass-input w-full"
                  placeholder="Localização"
                  value={newProject.location}
                  onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                />
                <textarea
                  className="glass-input w-full min-h-[80px]"
                  placeholder="Descrição opcional..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <div className="flex gap-2">
                  <button type="submit" className="glass-button-primary flex-1">Salvar</button>
                  <button
                    type="button"
                    className="glass-button flex-1"
                    onClick={() => setShowNewProject(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-card max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 space-y-4">
                <div className="skeleton h-12 w-full rounded-lg"></div>
                <div className="skeleton h-12 w-full rounded-lg"></div>
                <div className="skeleton h-12 w-full rounded-lg"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Folder size={48} className="mx-auto mb-2 opacity-20" />
                <p>Nenhum projeto encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between ${selectedProject?.id === project.id ? 'bg-white/10' : ''}`}
                    onClick={() => selectProject(project)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Folder size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{project.name}</h4>
                        <p className="text-xs text-slate-500">{project.client || 'Sem cliente'}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content: Project Calculations */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedProject ? (
            <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center text-gray-500 opacity-60">
              <FileText size={64} className="mb-4" />
              <p>Selecione um projeto para ver o histórico de cálculos</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Project Header */}
              <div className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{selectedProject.name}</h3>
                    <p className="text-sm text-slate-600">{selectedProject.description || 'Nenhuma descrição disponível.'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                      <Clock size={12} /> {formatDate(selectedProject.created_at)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={16} className="text-primary" /> {selectedProject.client || '-'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="text-primary" /> {selectedProject.location || '-'}
                  </div>
                </div>
              </div>

              {/* Calculations Tração */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 px-1">
                  <Calculator size={18} className="text-primary" /> Cálculos de Tração
                </h4>
                {history.tracao.length === 0 ? (
                  <div className="glass-card p-8 text-center text-gray-400 text-sm italic">
                    Nenhum cálculo de tração para este projeto.
                  </div>
                ) : (
                  history.tracao.map((calc) => (
                    <div key={calc.id} className="glass-card overflow-hidden">
                      <div className="bg-white/5 px-4 py-2 text-xs flex justify-between border-b border-white/10 text-slate-500">
                        <span>{formatDate(calc.timestamp)}</span>
                        <span className="font-semibold text-primary">TRAÇÃO</span>
                      </div>
                      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vão</p>
                          <p className="text-sm font-semibold">{calc.vao}m</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Flecha</p>
                          <p className="text-sm font-semibold text-primary">{calc.flecha}m</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estrutura</p>
                          <p className="text-sm font-semibold truncate">{calc.sugestao}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Calculations Tensão */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 px-1">
                  <Calculator size={18} className="text-primary" /> Cálculos de Queda de Tensão
                </h4>
                {history.tensao.length === 0 ? (
                  <div className="glass-card p-8 text-center text-gray-400 text-sm italic">
                    Nenhum cálculo de tensão para este projeto.
                  </div>
                ) : (
                  history.tensao.map((calc) => (
                    <div key={calc.id} className="glass-card overflow-hidden">
                      <div className="bg-white/5 px-4 py-2 text-xs flex justify-between border-b border-white/10 text-slate-500">
                        <span>{formatDate(calc.timestamp)}</span>
                        <span className="font-semibold text-orange-500">TENSÃO</span>
                      </div>
                      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Queda</p>
                          <p className={`text-sm font-semibold ${calc.status === 'OK' ? 'text-green-600' : 'text-red-500'}`}>
                            {calc.queda_percentual}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Corrente</p>
                          <p className="text-sm font-semibold">{calc.corrente}A</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Compr.</p>
                          <p className="text-sm font-semibold">{calc.comprimento}m</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${calc.status === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {calc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoCalculos;
