'use client';

/**
 * 🏥 RepoMed IA v6.0 - Medical Dashboard 2025
 * Premium medical interface for healthcare professionals
 * Enterprise upgrade with ultra-safe wrapper and feature flag control
 */

import React from 'react';
import MedicalDashboard2025 from '@/components/medical/MedicalDashboard2025';
import { useFeatureFlag } from '@/components/providers/FeatureFlagProvider';
import '@/styles/home-enterprise-2025.css';

export default function HomePage() {
  const isEnterpriseEnabled = useFeatureFlag('FF_HOME_ENTERPRISE');

  if (!isEnterpriseEnabled) {
    // Fallback: render original component without wrapper
    return <MedicalDashboard2025 />;
  }

  return (
    <div
      className="home-pro"
      data-home-pro="true"
      data-theme-aware="true"
      data-enterprise="v6.0"
      data-feature-flag="FF_HOME_ENTERPRISE"
    >
      <MedicalDashboard2025 />
    </div>
  );
}