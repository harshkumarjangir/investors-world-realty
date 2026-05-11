'use client';

import { useI18n } from '@/lib/i18n';

const teamMembers = [
  { name: 'Rajesh Kumar', role: 'Founder & CEO', bio: 'Visionary leader with 15+ years in real estate.' },
  { name: 'Priya Sharma', role: 'COO', bio: 'Operations expert driving growth and efficiency.' },
  { name: 'Amit Verma', role: 'CTO', bio: 'Tech innovator building our digital platform.' },
  { name: 'Neha Gupta', role: 'Head of Sales', bio: 'Sales strategist expanding our network nationwide.' },
];

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">{t('about.title')}</h1>
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
            Building trust and wealth through innovative real estate solutions
          </p>
        </div>
      </section>

      {/* Company History */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Our Story</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Founded in 2020, Investors World Realty was born from a vision to democratize real estate investment.
              We recognized that traditional real estate required significant capital and connections, leaving many
              aspiring investors on the sidelines. Our platform combines the power of network marketing with
              premium real estate opportunities, enabling anyone to participate in property investment and build
              a sustainable income stream.
            </p>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Today, we serve thousands of associates across India, offering carefully vetted properties and a
              transparent commission structure that rewards both investment and team building.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('about.mission')}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To make real estate investment accessible to everyone by combining premium properties with a
                network-based earning model. We empower individuals to build wealth through property ownership
                and team collaboration, creating financial freedom for our associates and their families.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('about.vision')}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To become India's most trusted MLM-powered real estate platform, recognized for transparency,
                quality properties, and life-changing income opportunities. We envision a community of 1 million
                empowered associates by 2030, each building their own real estate portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{t('about.team')}</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Meet the people driving our mission forward
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-1">{member.role}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
