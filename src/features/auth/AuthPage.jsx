import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
 GraduationCap,
 FlaskConical,
 CheckCircle2,
 ArrowRight,
 Zap,
} from 'lucide-react';

export default function AuthPage() {
 const navigate = useNavigate();
 const { t } = useTranslation('auth');
 const [selectedRole, setSelectedRole] = useState(null);

 const rolesData = [
 {
  id: 'academic_user',
  title: t('roleSelect.academic.title'),
  description: t('roleSelect.academic.description'),
  icon: GraduationCap,
  color: 'var(--primary)',
  features: [
  t('roleSelect.academic.feature1'),
  t('roleSelect.academic.feature2'),
  t('roleSelect.academic.feature3'),
  ],
 },
 {
  id: 'researcher',
  title: t('roleSelect.researcher.title'),
  description: t('roleSelect.researcher.description'),
  icon: FlaskConical,
  color: 'var(--primary)',
  features: [
  t('roleSelect.researcher.feature1'),
  t('roleSelect.researcher.feature2'),
  t('roleSelect.researcher.feature3'),
  ],
 },
 ];

 return (
 <div>
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-6 border border-primary/30 bg-primary/10 text-primary">
  <Zap size={10} /> {t('roleSelect.heading')}
  </div>

  <h2 className="text-2xl lg:text-3xl font-black text-foreground mb-1 font-display tracking-tight">
  {t('roleSelect.heading')}
  </h2>
  <p className="text-sm mb-8 text-foreground/80">
  {t('roleSelect.subtitle')}
  </p>

  <div className="space-y-4">
  {rolesData.map((role) => {
   const isSelected = selectedRole === role.id;
   return (
   <div
    key={role.id}
    onClick={() => setSelectedRole(role.id)}
    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group overflow-hidden ${
    isSelected
     ? 'border-primary/60 bg-primary/[0.08]'
     : 'border-primary/30 bg-muted/15 hover:border-primary/30 hover:bg-muted/25'
    }`}
   >
    {isSelected && (
    <div
     className="absolute top-0 left-0 h-1 w-full rounded-t-2xl"
     style={{ background: 'var(--primary)' }}
    />
    )}
    <div className="flex items-start gap-4">
    <div
     className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
     isSelected ? 'shadow-md' : 'bg-muted/25'
     }`}
     style={{
     backgroundColor: isSelected ? 'var(--primary)' : undefined,
     boxShadow: isSelected ? '0 4px 12px var(--primary)' : undefined,
     }}
    >
     <role.icon
     size={24}
     style={{
      color: isSelected ? 'var(--primary-foreground)' : 'var(--primary)',
      filter: !isSelected ? 'drop-shadow(0 2px 6px var(--primary))' : undefined,
     }}
     />
    </div>
    <div className="flex-1">
     <h3 className="text-base font-bold text-foreground mb-1">{role.title}</h3>
     <p className="text-xs mb-3 text-foreground/80">{role.description}</p>
     <ul className="space-y-2">
     {role.features.map((feature, idx) => (
      <li key={idx} className="flex items-center gap-2 text-xs text-foreground/80">
      <CheckCircle2 size={12} style={{ color: 'var(--primary)' }} />
      {feature}
      </li>
     ))}
     </ul>
    </div>
    </div>
   </div>
   );
  })}
  </div>

  <motion.button
  whileHover={selectedRole ? { scale: 1.02 } : {}}
  whileTap={selectedRole ? { scale: 0.98 } : {}}
  disabled={!selectedRole}
  onClick={() => {
   navigate('/register', { state: { role: selectedRole } });
  }}
  className={`w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 mt-8 transition-all duration-300 ${
   selectedRole
   ? 'text-primary border border-primary/60 bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary'
   : 'border border-primary/35 bg-muted/15 text-muted-foreground'
  }`}
  >
  {t('roleSelect.continue')}
  <ArrowRight size={16} />
  </motion.button>
 </div>
 );
}
