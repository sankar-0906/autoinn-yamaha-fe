import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBranches } from '../api/branch';
import { useAuth } from './AuthContext';

interface Branch {
    id: string;
    name: string;
    [key: string]: any;
}

interface BranchContextType {
    selectedBranchIds: string[];
    setSelectedBranchIds: (ids: string[]) => void;
    branches: Branch[];
    loading: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [selectedBranchIds, setSelectedBranchIdsState] = useState<string[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial load from localStorage and API
    useEffect(() => {
        const initBranches = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                const res = await getBranches({ page: 1, size: 1000 });
                const branchData = res?.data?.branch || res?.data?.data?.branch || [];
                setBranches(branchData);

                // Restore selection from localStorage
                const saved = localStorage.getItem('selectedBranchIds');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Filter valid IDs and remove any 'ALL' legacy values
                    const validIds = parsed.filter((id: string) => id !== 'ALL' && branchData.some((b: any) => b.id === id));
                    setSelectedBranchIdsState(validIds.length > 0 ? validIds : branchData.map((b: any) => b.id));
                } else {
                    // Default to all branches if no selection exists
                    setSelectedBranchIdsState(branchData.map((b: any) => b.id));
                }
            } catch (err) {
                console.error('Failed to load branches', err);
            } finally {
                setLoading(false);
            }
        };

        initBranches();
    }, [user]);

    const setSelectedBranchIds = (ids: string[]) => {
        // Remove 'ALL' if it somehow slips in
        const filteredIds = ids.filter(id => id !== 'ALL');
        setSelectedBranchIdsState(filteredIds);
        localStorage.setItem('selectedBranchIds', JSON.stringify(filteredIds));
        
        // Dispatch custom event for non-React parts of the app
        window.dispatchEvent(new CustomEvent('branchChange', { detail: { branchIds: filteredIds } }));
    };

    return (
        <BranchContext.Provider value={{ selectedBranchIds, setSelectedBranchIds, branches, loading }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = () => {
    const context = useContext(BranchContext);
    if (context === undefined) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
};
