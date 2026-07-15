const fs = require('fs');

const files = [
  'src/app/dashboard/page.jsx',
  'src/components/organisms/DashboardStats.jsx',
  'src/components/organisms/RecentActivity.jsx',
  'src/components/organisms/SkillRadarChart.jsx',
  'src/components/organisms/WeeklyConsistency.jsx',
  'src/components/organisms/RecommendationHub.jsx',
  'src/components/organisms/AttendanceWidget.jsx',
  'src/components/organisms/OverallScoreGauge.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace text mapping step by step carefully
  content = content.replace(/text-4xl\b/g, 'text-5xl');
  content = content.replace(/text-3xl\b/g, 'text-4xl');
  content = content.replace(/text-2xl\b/g, 'text-3xl');
  content = content.replace(/text-xl\b/g, 'text-2xl');
  content = content.replace(/text-lg\b/g, 'text-xl');
  content = content.replace(/text-base\b/g, 'text-lg');
  content = content.replace(/text-sm\b/g, 'text-base');
  content = content.replace(/text-xs\b/g, 'text-sm');
  content = content.replace(/text-\[11px\]/g, 'text-xs');
  content = content.replace(/text-\[10px\]/g, 'text-[11px]');
  content = content.replace(/text-\[9px\]/g, 'text-[10px]');
  content = content.replace(/text-\[8px\]/g, 'text-[9px]');

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
