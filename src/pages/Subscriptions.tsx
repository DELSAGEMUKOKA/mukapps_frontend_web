import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  AlertCircle,
  Crown,
  Zap,
  Shield,
  Check,
} from 'lucide-react';
import {
  subscriptionsService,
  Subscription,
  SubscriptionPlan,
  SubscriptionHistory,
} from '../lib/api/subscriptions.service';

export const Subscriptions: React.FC = () => {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes, historyRes] = await Promise.all([
        subscriptionsService.getCurrentSubscription(),
        subscriptionsService.getPlans(),
        subscriptionsService.getHistory(),
      ]);

      if (subRes.success) setCurrentSubscription(subRes.data);
      if (plansRes.success) setPlans(plansRes.data);
      if (historyRes.success) setHistory(historyRes.data);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (planId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir modifier votre abonnement ?')) return;

    setActionLoading(true);
    try {
      const result = await subscriptionsService.updateSubscription({ plan_id: planId });
      if (result.success) {
        alert('Abonnement mis à jour avec succès');
        await loadData();
      } else {
        alert(result.error || "Erreur lors de la mise à jour de l'abonnement");
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert("Erreur lors de la mise à jour de l'abonnement");
    } finally {
      setActionLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir annuler votre abonnement ? Vous conserverez l\'accès jusqu\'à la fin de la période actuelle.'
      )
    )
      return;

    setActionLoading(true);
    try {
      const result = await subscriptionsService.cancelSubscription();
      if (result.success) {
        alert('Abonnement annulé avec succès');
        await loadData();
      } else {
        alert(result.error || "Erreur lors de l'annulation de l'abonnement");
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert("Erreur lors de l'annulation de l'abonnement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir renouveler votre abonnement ?')) return;

    setActionLoading(true);
    try {
      const result = await subscriptionsService.renewSubscription();
      if (result.success) {
        alert('Abonnement renouvelé avec succès');
        await loadData();
      } else {
        alert(result.error || "Erreur lors du renouvellement de l'abonnement");
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
      alert("Erreur lors du renouvellement de l'abonnement");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: Subscription['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      trial: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-700',
    };

    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      trial: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      expired: <XCircle className="w-3 h-3" />,
    };

    const labels = {
      active: 'Actif',
      trial: 'Essai gratuit',
      cancelled: 'Annulé',
      expired: 'Expiré',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const getActionIcon = (action: SubscriptionHistory['action']) => {
    const icons = {
      created: <CheckCircle className="w-5 h-5 text-green-600" />,
      upgraded: <ArrowUpCircle className="w-5 h-5 text-blue-600" />,
      downgraded: <ArrowDownCircle className="w-5 h-5 text-orange-600" />,
      renewed: <RefreshCw className="w-5 h-5 text-green-600" />,
      cancelled: <XCircle className="w-5 h-5 text-red-600" />,
    };

    return icons[action];
  };

  const getActionLabel = (action: SubscriptionHistory['action']) => {
    const labels = {
      created: 'Création',
      upgraded: 'Mise à niveau',
      downgraded: 'Rétrogradation',
      renewed: 'Renouvellement',
      cancelled: 'Annulation',
    };

    return labels[action];
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Enterprise')) return <Crown className="w-6 h-6" />;
    if (planName.includes('Professional')) return <Zap className="w-6 h-6" />;
    if (planName.includes('Basic')) return <Shield className="w-6 h-6" />;
    return <CreditCard className="w-6 h-6" />;
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.id === currentSubscription?.plan_id);
  const daysRemaining = currentSubscription?.end_date
    ? getDaysRemaining(currentSubscription.end_date)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Abonnements</h1>
        <p className="text-gray-600 mt-1">Gérez votre abonnement et votre facturation</p>
      </div>

      {currentSubscription && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {currentPlan && getPlanIcon(currentPlan.name)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{currentPlan?.name || 'Plan actuel'}</h2>
                  <p className="text-blue-100">{currentPlan?.description}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-blue-100 text-sm">Statut</p>
                  <div className="mt-1">{getStatusBadge(currentSubscription.status)}</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-blue-100 text-sm">Prix mensuel</p>
                  <p className="text-2xl font-bold mt-1">
                    {currentPlan?.price.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </p>
                </div>
                {daysRemaining !== null && (
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <p className="text-blue-100 text-sm">Jours restants</p>
                    <p className="text-2xl font-bold mt-1">{daysRemaining}</p>
                  </div>
                )}
              </div>

              {currentSubscription.trial_end_date && currentSubscription.status === 'trial' && (
                <div className="mt-4 flex items-center gap-2 bg-yellow-500 bg-opacity-20 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">
                    Période d'essai gratuit jusqu'au{' '}
                    {new Date(currentSubscription.trial_end_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {currentSubscription.status === 'active' && currentSubscription.auto_renew && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler l'abonnement
                </button>
              )}
              {currentSubscription.status === 'cancelled' && (
                <button
                  onClick={handleRenewSubscription}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white hover:bg-opacity-90 text-blue-600 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  Réactiver l'abonnement
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Plans disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentSubscription?.plan_id;
            const isSelected = selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
                  isCurrentPlan
                    ? 'border-blue-600 ring-2 ring-blue-100'
                    : isSelected
                    ? 'border-blue-400'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {getPlanIcon(plan.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    {isCurrentPlan && (
                      <span className="text-xs text-blue-600 font-medium">Plan actuel</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {plan.price.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </p>
                  <p className="text-gray-600 text-sm">par {plan.billing_period}</p>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>

                {!isCurrentPlan && (
                  <button
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      handleUpdateSubscription(plan.id);
                    }}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {actionLoading && isSelected ? 'Traitement...' : 'Choisir ce plan'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Historique des abonnements</h2>
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="mt-1">{getActionIcon(item.action)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{getActionLabel(item.action)}</p>
                    <span className="text-gray-400">•</span>
                    <p className="text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">
                    {item.plan?.name}
                    {item.previous_plan_id && ` (précédemment ${item.previous_plan?.name})`}
                  </p>
                  {item.price_paid > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Montant payé:{' '}
                      {item.price_paid.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </p>
                  )}
                  {item.notes && <p className="text-sm text-gray-600 mt-1 italic">{item.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Aucun historique d'abonnement disponible</p>
        </div>
      )}
    </div>
  );
};
