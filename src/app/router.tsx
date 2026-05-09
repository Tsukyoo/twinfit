import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { ProfileId } from '../types';
import { getSelectedProfile, saveSelectedProfile, clearSelectedProfile } from '@utils/storage';
import { seedInitialData } from '../db/seed';
import { isOnboardingCompleted } from '../logic/onboarding';

// Pages
import { ProfileSelectPage } from '@features/profiles/ProfileSelectPage';
import { DashboardPage } from '@features/dashboard/DashboardPage';
import { PlanningPage } from '@features/planning/PlanningPage';
import { NutritionPage } from '@features/nutrition/NutritionPage';
import { ProgressPage } from '@features/progress/ProgressPage';
import { LeaderboardPage } from '@features/leaderboard/LeaderboardPage';
import { SettingsPage } from '@features/settings/SettingsPage';
import { ActiveWorkoutPage } from '@features/workout/ActiveWorkoutPage';
import { NotFoundPage } from '@features/NotFoundPage';
import { OnboardingOverlay } from '@features/onboarding/OnboardingOverlay';

function AppRoutes() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileId | undefined>(
    getSelectedProfile()
  );
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSelectProfile = (profileId: ProfileId) => {
    saveSelectedProfile(profileId);
    setSelectedProfile(profileId);
    // Check if onboarding needed
    if (!isOnboardingCompleted(profileId)) {
      setShowOnboarding(true);
    }
  };

  const handleChangeProfile = () => {
    clearSelectedProfile();
    setSelectedProfile(undefined);
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  useEffect(() => {
    seedInitialData().catch(console.error);
  }, []);

  return (
    <>
      <Routes>
        {/* Profile Selection - Default route */}
        <Route
          path="/"
          element={
            selectedProfile ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ProfileSelectPage onSelectProfile={handleSelectProfile} />
            )
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            selectedProfile ? (
              <DashboardPage
                profileId={selectedProfile}
                onChangeProfile={handleChangeProfile}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Planning / Workout */}
        <Route
          path="/planning"
          element={
            selectedProfile ? (
              <PlanningPage
                profileId={selectedProfile}
                onChangeProfile={handleChangeProfile}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Nutrition */}
        <Route
          path="/nutrition"
          element={
            selectedProfile ? (
              <NutritionPage
                profileId={selectedProfile}
                onChangeProfile={handleChangeProfile}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Progress */}
        <Route
          path="/progress"
          element={
            selectedProfile ? (
              <ProgressPage
                profileId={selectedProfile}
                onChangeProfile={handleChangeProfile}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Leaderboard / Duel */}
        <Route
          path="/leaderboard"
          element={
            selectedProfile ? (
              <LeaderboardPage
                profileId={selectedProfile}
                onChangeProfile={handleChangeProfile}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            selectedProfile ? (
              <SettingsPage
                profileId={selectedProfile}
                onChangeProfile={handleChangeProfile}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Active Workout */}
        <Route
          path="/workout/:planId"
          element={
            selectedProfile ? (
              <ActiveWorkoutPageWrapper profileId={selectedProfile} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Onboarding Overlay - shown when needed */}
      {showOnboarding && selectedProfile && (
        <OnboardingOverlay
          profileId={selectedProfile as ProfileId}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
    </>
  );
}

function ActiveWorkoutPageWrapper({ profileId }: { profileId: ProfileId }) {
  const { planId } = useParams<{ planId: string }>();
  if (!planId) return <Navigate to="/dashboard" replace />;
  return <ActiveWorkoutPage profileId={profileId} planId={planId} />;
}

export function Router() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
