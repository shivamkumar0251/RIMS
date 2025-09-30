import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiGithub, FiSlack } from 'react-icons/fi';
import UserLayout from '../../layouts/UserLayout';

// --- Global Types ---
type Section = 'profile' | 'security' | 'billing' | 'notifications' | 'integrations';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    bio: string;
  };
  security: {
    twoFactorEnabled: boolean;
  };
  integrations: {
    github: { connected: boolean; user: string };
    slack: { connected: boolean; team: string };
  };
}

// --- CSS Animation Component ---
const AnimationStyles = () => (
  <style>{`
    @keyframes fade-in {
      from { opacity: 0.5; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
  `}</style>
);

// --- Main Component ---
const TabbedSettingsUI: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Section>('profile');
    
    const [settings, setSettings] = useState<UserSettings>({
        profile: {
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            bio: '',
        },
        security: {
            twoFactorEnabled: false,
        },
        integrations: {
            github: { connected: true, user: 'rajneesh-dev' },
            slack: { connected: false, team: '' },
        },
    });

    // --- Handler Functions ---
    const handleProfileUpdate = (newProfile: UserSettings['profile']) => {
        setSettings(prev => ({ ...prev, profile: newProfile }));
    };

    const handle2FAToggle = () => {
        setSettings(prev => ({ ...prev, security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled }}));
    };

    const handleIntegrationToggle = (integrationName: keyof UserSettings['integrations']) => {
        setSettings(prev => ({
            ...prev,
            integrations: { ...prev.integrations, [integrationName]: { ...prev.integrations[integrationName], connected: !prev.integrations[integrationName].connected } }
        }));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': 
                return <ProfileSection profileData={settings.profile} onSave={handleProfileUpdate} />;
            case 'security': 
                return <SecuritySection securityData={settings.security} onToggle2FA={handle2FAToggle} />;
            case 'integrations': 
                return <IntegrationsSection integrationsData={settings.integrations} onToggle={handleIntegrationToggle} />;
            case 'billing': 
                return <ContentWrapper title="Billing" description="Manage your subscription and payment methods."><p>Billing content goes here...</p></ContentWrapper>;
            case 'notifications': 
                return <ContentWrapper title="Notifications" description="Choose how you want to be notified."><p>Notification settings go here...</p></ContentWrapper>;
            default: 
                return <ProfileSection profileData={settings.profile} onSave={handleProfileUpdate} />;
        }
    };

    return (
        <UserLayout>
        <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
            <AnimationStyles />
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
            </header>

            <div className="bg-white rounded-lg shadow-md">
                <nav className="border-b border-gray-200">
                    <div className="px-6 flex space-x-8">
                        <TabButton label="Profile" section="profile" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton label="Security" section="security" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton label="Integrations" section="integrations" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton label="Billing" section="billing" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton label="Notifications" section="notifications" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                </nav>
                <main className="p-6 sm:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
        </UserLayout>
    );
};

// --- Child Section Components ---
interface ProfileSectionProps {
    profileData: UserSettings['profile'];
    onSave: (newProfile: UserSettings['profile']) => void;
}
const ProfileSection: React.FC<ProfileSectionProps> = ({ profileData, onSave }) => {
    const [formData, setFormData] = useState(profileData);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const initialData = { firstName: '', lastName: '', username: '', email: '', bio: '' };

    useEffect(() => { setFormData(profileData); }, [profileData]);
    useEffect(() => { 
        setHasChanges(JSON.stringify(formData) !== JSON.stringify(initialData) && JSON.stringify(formData) !== JSON.stringify(profileData)); 
    }, [formData, profileData]);
    
    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            onSave(formData);
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }, 1000);
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    return (
        <ContentWrapper title="Public Profile" description="This information will be displayed publicly.">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
                            <InputField name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
                        </div>
                        <InputField name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                        <InputField name="username" label="Username" prefix="your-app.com/" value={formData.username} onChange={handleChange} placeholder="your-username" />
                    </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">About Me</h3>
                    <p className="mt-1 text-sm text-gray-500">A brief description of yourself.</p>
                    <div className="mt-4">
                        <TextareaField name="bio" label="Bio" value={formData.bio} onChange={handleChange} placeholder="Tell us a little about yourself." />
                    </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Photo</h3>
                     <div className="mt-4 flex items-center space-x-4">
                        <img className="h-20 w-20 rounded-full object-cover" src="https://via.placeholder.com/150/cccccc/808080?Text=User" alt="Profile" />
                        <div className="flex space-x-2">
                            <button className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Change</button>
                            <button className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Remove</button>
                        </div>
                    </div>
                </div>
            </div>
            <FooterActions onSave={handleSave} isSaving={isSaving} hasChanges={hasChanges} success={showSuccess} />
        </ContentWrapper>
    );
};

interface SecuritySectionProps {
    securityData: UserSettings['security'];
    onToggle2FA: () => void;
}
const SecuritySection: React.FC<SecuritySectionProps> = ({ securityData, onToggle2FA }) => (
    <ContentWrapper title="Security" description="Manage your account's security settings.">
        <div className="space-y-6">
            <div>
                <h3 className="text-md font-semibold text-gray-700">Two-Factor Authentication (2FA)</h3>
                <div className={`mt-2 p-4 border rounded-md flex items-center justify-between ${securityData.twoFactorEnabled ? 'bg-green-50 border-green-200' : ''}`}>
                    <div>
                        <p className="font-medium">{securityData.twoFactorEnabled ? '2FA is Enabled' : '2FA is not enabled'}</p>
                        <p className="text-sm text-gray-500">Protect your account with an extra layer of security.</p>
                    </div>
                    <button onClick={onToggle2FA} className={`px-4 py-2 text-sm font-medium text-white rounded-md ${securityData.twoFactorEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        {securityData.twoFactorEnabled ? 'Disable' : 'Enable 2FA'}
                    </button>
                </div>
            </div>
        </div>
    </ContentWrapper>
);

interface IntegrationsSectionProps {
    integrationsData: UserSettings['integrations'];
    onToggle: (integrationName: keyof UserSettings['integrations']) => void;
}
const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({ integrationsData, onToggle }) => (
    <ContentWrapper title="Integrations" description="Connect your account with third-party services.">
        <div className="space-y-6">
            <div>
                <h3 className="text-md font-semibold text-gray-700">Available Apps</h3>
                <IntegrationCard 
                    icon={<FiGithub />} 
                    name="GitHub" 
                    description="Sync your repositories and activity." 
                    connected={integrationsData.github.connected}
                    onToggle={() => onToggle('github')}
                />
                <IntegrationCard 
                    icon={<FiSlack />} 
                    name="Slack" 
                    description="Receive notifications in your channels."
                    connected={integrationsData.slack.connected}
                    onToggle={() => onToggle('slack')}
                />
            </div>
        </div>
    </ContentWrapper>
);


// --- Reusable UI Helper Components ---
interface TabButtonProps {
    label: string;
    section: Section;
    activeTab: Section;
    setActiveTab: (section: Section) => void;
}
const TabButton: React.FC<TabButtonProps> = ({ label, section, activeTab, setActiveTab }) => {
    const isActive = activeTab === section;
    return (
        <button 
            onClick={() => setActiveTab(section)} 
            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
            {label}
        </button>
    );
};

interface ContentWrapperProps {
    title: string;
    description: string;
    children: ReactNode;
}
const ContentWrapper: React.FC<ContentWrapperProps> = ({ title, description, children }) => (
    <div key={title} className="animate-fade-in">
        <header>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </header>
        <div className="mt-6">{children}</div>
    </div>
);

interface InputFieldProps {
    label: string;
    name: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    prefix?: string;
    placeholder?: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', prefix, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex rounded-md shadow-sm">
            {prefix && <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">{prefix}</span>}
            <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={`flex-1 block w-full sm:text-sm border-gray-300 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${prefix ? 'rounded-none rounded-r-md' : 'rounded-md'}`} />
        </div>
    </div>
);

interface TextareaFieldProps {
    label: string;
    name: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
}
const TextareaField: React.FC<TextareaFieldProps> = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            <textarea
                id={name}
                name={name}
                rows={rows}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="block w-full sm:text-sm border-gray-300 rounded-md shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
    </div>
);

interface FooterActionsProps {
    onSave?: () => void;
    isSaving?: boolean;
    hasChanges: boolean;
    success?: boolean;
}
const FooterActions: React.FC<FooterActionsProps> = ({ onSave, isSaving, hasChanges, success }) => (
    <footer className="mt-8 pt-5 border-t flex items-center justify-end space-x-4">
        {success && <div className="flex items-center text-green-600 animate-fade-in"><FiCheckCircle className="mr-2"/> Saved!</div>}
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">Cancel</button>
        <button 
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
            {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
    </footer>
);

interface IntegrationCardProps {
    icon: ReactNode;
    name: string;
    description: string;
    connected: boolean;
    onToggle: () => void;
}
const IntegrationCard: React.FC<IntegrationCardProps> = ({icon, name, description, connected, onToggle}) => (
    <div className="mt-2 p-4 border rounded-md flex items-center justify-between">
        <div className="flex items-center">
            <span className="text-2xl mr-4">{icon}</span>
            <div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
        <button onClick={onToggle} className={`px-4 py-2 w-28 text-sm font-medium rounded-md ${connected ? 'bg-white border text-red-600 hover:bg-red-50' : 'bg-black text-white hover:bg-gray-800'}`}>
            {connected ? 'Disconnect' : 'Connect'}
        </button>
    </div>
);

export default TabbedSettingsUI;