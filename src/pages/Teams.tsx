// src/pages/Teams.tsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  UserPlus,
  MoreVertical,
  User,
  Mail,
  Calendar,
  Shield,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdAt: string;
  createdBy: string;
}

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'leader' | 'member';
  joinedAt: string;
}

export const Teams: React.FC = () => {
  const { user } = useAuth();
  const { canManageTeams } = usePermissions();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulaire de création d'équipe
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
  });

  // Formulaire d'ajout de membre
  const [memberForm, setMemberForm] = useState({
    email: '',
    role: 'member' as 'leader' | 'member',
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données mockées
      const mockTeams: Team[] = [
        {
          id: '1',
          name: 'Équipe de vente',
          description: 'Équipe chargée des ventes en magasin',
          createdAt: '2025-01-15T10:00:00Z',
          createdBy: 'Admin',
          members: [
            {
              id: '1',
              userId: '101',
              name: 'Jean Dupont',
              email: 'jean.dupont@example.com',
              role: 'leader',
              joinedAt: '2025-01-15T10:00:00Z'
            },
            {
              id: '2',
              userId: '102',
              name: 'Marie Martin',
              email: 'marie.martin@example.com',
              role: 'member',
              joinedAt: '2025-01-16T14:30:00Z'
            }
          ]
        },
        {
          id: '2',
          name: 'Équipe de caisse',
          description: 'Gestion des caisses et des transactions',
          createdAt: '2025-02-01T09:00:00Z',
          createdBy: 'Admin',
          members: [
            {
              id: '3',
              userId: '103',
              name: 'Pierre Durand',
              email: 'pierre.durand@example.com',
              role: 'leader',
              joinedAt: '2025-02-01T09:00:00Z'
            }
          ]
        }
      ];
      
      setTeams(mockTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Simuler la création
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTeam: Team = {
        id: Date.now().toString(),
        ...teamForm,
        members: [],
        createdAt: new Date().toISOString(),
        createdBy: user?.name || 'Admin'
      };
      
      setTeams([...teams, newTeam]);
      setShowCreateModal(false);
      setTeamForm({ name: '', description: '' });
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    
    setSaving(true);
    
    try {
      // Simuler l'ajout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMember: TeamMember = {
        id: Date.now().toString(),
        userId: Date.now().toString(),
        name: memberForm.email.split('@')[0],
        email: memberForm.email,
        role: memberForm.role,
        joinedAt: new Date().toISOString()
      };
      
      const updatedTeams = teams.map(team => 
        team.id === selectedTeam.id
          ? { ...team, members: [...team.members, newMember] }
          : team
      );
      
      setTeams(updatedTeams);
      setShowAddMemberModal(false);
      setMemberForm({ email: '', role: 'member' });
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;
    
    try {
      // Simuler la suppression
      await new Promise(resolve => setTimeout(resolve, 500));
      setTeams(teams.filter(team => team.id !== teamId));
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;
    
    try {
      const updatedTeams = teams.map(team => 
        team.id === teamId
          ? { ...team, members: team.members.filter(m => m.id !== memberId) }
          : team
      );
      setTeams(updatedTeams);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des équipes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des équipes</h1>
          <p className="text-gray-600 mt-1">Organisez vos collaborateurs en équipes</p>
        </div>
        
        {canManageTeams() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle équipe
          </button>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une équipe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Liste des équipes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.description}</p>
                  </div>
                </div>
                
                {canManageTeams() && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowAddMemberModal(true);
                      }}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="Ajouter un membre"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Supprimer l'équipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Membres ({team.members.length})
              </h4>
              
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {member.role === 'leader' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Leader
                        </span>
                      )}
                      
                      {canManageTeams() && member.userId !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(team.id, member.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Retirer le membre"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {team.members.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Aucun membre dans cette équipe
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Créée le {new Date(team.createdAt).toLocaleDateString('fr-FR')}
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Par {team.createdBy}
              </div>
            </div>
          </div>
        ))}
        
        {filteredTeams.length === 0 && (
          <div className="lg:col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Aucune équipe trouvée</p>
          </div>
        )}
      </div>

      {/* Modal de création d'équipe */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Créer une équipe</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'équipe *
                </label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: Équipe de vente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Description de l'équipe..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout de membre */}
      {showAddMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Ajouter un membre à {selectedTeam.name}
              </h2>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email du membre *
                </label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: collaborateur@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as 'leader' | 'member' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">Membre</option>
                  <option value="leader">Leader</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;