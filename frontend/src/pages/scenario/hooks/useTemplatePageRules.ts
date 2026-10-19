import type { Rule } from '@/components/RoutingGraphTypes.ts';
import { api } from '@/services/api.ts';
import type { ProviderModelsDataByUuid } from '@/types/provider.ts';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface UseTemplatePageRulesParams {
    rules: Rule[];
    onRulesChange?: (updatedRules: Rule[]) => void;
    showNotification: (message: string, severity: 'success' | 'info' | 'warning' | 'error') => void;
    scenario?: string;
    loadRules?: (scenario: string) => Promise<void>;
}

export interface CreateRuleOptions {
    providerUuid: string;
    model: string;
}

export interface UseTemplatePageRulesReturn {
    providerModelsByUuid: ProviderModelsDataByUuid;
    refreshingProviders: string[];
    handleRuleChange: (updatedRule: Rule) => void;
    handleProviderModelsChange: (providerUuid: string, models: any) => void;
    handleRefreshModels: (providerUuid: string) => Promise<void>;
    handleCreateRule: (options?: CreateRuleOptions) => Promise<string | null>;
    handleCreateRules: (options: CreateRuleOptions[]) => Promise<string[]>;
}

export const resolveRuleName = (desiredName: string, existingNames: Set<string>): string => {
    if (!existingNames.has(desiredName)) return desiredName;
    return `${desiredName}-${uuidv4().slice(0, 6)}`;
};

export const useTemplatePageRules = ({
    rules,
    onRulesChange,
    showNotification,
    scenario,
    loadRules,
}: UseTemplatePageRulesParams): UseTemplatePageRulesReturn => {
    const [providerModelsByUuid, setProviderModelsByUuid] = useState<ProviderModelsDataByUuid>({});
    const [refreshingProviders, setRefreshingProviders] = useState<string[]>([]);

    const handleRuleChange = useCallback((updatedRule: Rule) => {
        if (onRulesChange) {
            const updatedRules = rules.map(r =>
                r.uuid === updatedRule.uuid ? updatedRule : r
            );
            onRulesChange(updatedRules);
        }
    }, [rules, onRulesChange]);

    const handleProviderModelsChange = useCallback((providerUuid: string, models: any) => {
        setProviderModelsByUuid((prev: any) => ({
            ...prev,
            [providerUuid]: models,
        }));
    }, []);

    const handleRefreshModels = useCallback(async (providerUuid: string) => {
        if (!providerUuid) return;

        try {
            setRefreshingProviders(prev => [...prev, providerUuid]);
            const result = await api.updateProviderModelsByUUID(providerUuid);
            if (result.success && result.data) {
                setProviderModelsByUuid((prev: any) => ({
                    ...prev,
                    [providerUuid]: result.data,
                }));
                showNotification(`Models refreshed successfully!`, 'success');
            } else {
                showNotification(`Failed to refresh models: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error refreshing models:', error);
            showNotification(`Error refreshing models`, 'error');
        } finally {
            setRefreshingProviders(prev => prev.filter(p => p !== providerUuid));
        }
    }, [showNotification]);

    // Creates one rule through the API, without reloading or notifying, so a
    // single create and a batch share naming, conflict retry and validation.
    // Returns the created rule, or an error message.
    const createOneRule = useCallback(async (
        options: CreateRuleOptions | undefined,
        existingNames: Set<string>,
    ): Promise<{ rule: Rule } | { error: string }> => {
        const requestModel = options?.model
            ? resolveRuleName(options.model, existingNames)
            : `model-${uuidv4().slice(0, 8)}`;
        const initialServices = options
            ? [{
                provider: options.providerUuid,
                model: options.model,
                weight: 0,
                active: true,
                time_window: 0,
            }]
            : [];

        const newRuleData = {
            scenario: scenario,
            request_model: requestModel,
            response_model: '',
            active: true,
            services: initialServices,
        };

        // Create rule via API (empty string for UUID signals backend to generate new UUID)
        let result = await api.createRule('', newRuleData);

        // If backend reports name conflict, retry once with a random suffix
        if (!result?.success && result?.error?.includes('already exists')) {
            newRuleData.request_model = `${requestModel}-${uuidv4().slice(0, 6)}`;
            result = await api.createRule('', newRuleData);
        }

        if (!result?.success) {
            return { error: result?.error || 'Unknown error' };
        }

        if (!result.data || !result.data.uuid) {
            console.error('Invalid createRule response:', result);
            return { error: 'Invalid response from server (missing UUID)' };
        }

        // Verify the rule has the expected scenario
        if (result.data.scenario !== scenario) {
            showNotification(`Warning: Rule created but scenario mismatch (expected: ${scenario}, got: ${result.data.scenario})`, 'warning');
        }

        existingNames.add(result.data.request_model);
        return { rule: result.data };
    }, [scenario, showNotification]);

    const reloadAfterCreate = useCallback(async (created: Rule[]) => {
        // Reload rules from backend to verify persistence
        if (loadRules && scenario) {
            await loadRules(scenario);
        } else if (onRulesChange) {
            // Fallback: update local state if loadRules not provided
            onRulesChange([...rules, ...created]);
        }
    }, [scenario, rules, onRulesChange, loadRules]);

    const existingRuleNames = useCallback(
        () => new Set(rules.map(r => r.request_model).filter(Boolean) as string[]),
        [rules],
    );

    const handleCreateRule = useCallback(async (options?: CreateRuleOptions): Promise<string | null> => {
        if (!scenario) {
            showNotification('Cannot create rule: scenario not specified', 'error');
            return null;
        }

        try {
            const outcome = await createOneRule(options, existingRuleNames());
            if ('error' in outcome) {
                showNotification(`Failed to create rule: ${outcome.error}`, 'error');
                return null;
            }
            await reloadAfterCreate([outcome.rule]);
            showNotification('Routing rule created successfully!', 'success');
            return outcome.rule.uuid;
        } catch (error) {
            console.error('Error creating rule:', error);
            showNotification(`Failed to create routing rule: ${(error as Error).message || 'Unknown error'}`, 'error');
            return null;
        }
    }, [scenario, showNotification, createOneRule, existingRuleNames, reloadAfterCreate]);

    // One rule per model, created in order so names stay unique within the
    // batch; the list reloads once at the end. Returns the created uuids.
    const handleCreateRules = useCallback(async (options: CreateRuleOptions[]): Promise<string[]> => {
        if (options.length <= 1) {
            const uuid = await handleCreateRule(options[0]);
            return uuid ? [uuid] : [];
        }
        if (!scenario) {
            showNotification('Cannot create rule: scenario not specified', 'error');
            return [];
        }

        const names = existingRuleNames();
        const created: Rule[] = [];
        const failures: string[] = [];
        for (const option of options) {
            try {
                const outcome = await createOneRule(option, names);
                if ('error' in outcome) {
                    failures.push(`${option.model}: ${outcome.error}`);
                } else {
                    created.push(outcome.rule);
                }
            } catch (error) {
                failures.push(`${option.model}: ${(error as Error).message || 'Unknown error'}`);
            }
        }

        if (created.length > 0) {
            await reloadAfterCreate(created);
        }
        if (failures.length === 0) {
            showNotification(`Added ${created.length} models`, 'success');
        } else {
            showNotification(
                `Added ${created.length} of ${options.length} models. Failed: ${failures.join('; ')}`,
                created.length > 0 ? 'warning' : 'error',
            );
        }
        return created.map(r => r.uuid);
    }, [scenario, handleCreateRule, existingRuleNames, createOneRule, reloadAfterCreate, showNotification]);

    return {
        providerModelsByUuid,
        refreshingProviders,
        handleRuleChange,
        handleProviderModelsChange,
        handleRefreshModels,
        handleCreateRule,
        handleCreateRules,
    };
};
