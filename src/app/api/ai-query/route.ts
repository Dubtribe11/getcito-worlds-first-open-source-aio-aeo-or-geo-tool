import { NextRequest, NextResponse } from 'next/server';
import { ProviderManager } from '@/lib/api-providers/provider-manager';
import { APIRequest } from '@/lib/api-providers/types';

const providerManager = new ProviderManager();

// Providers that are actually configured via environment keys. (Note: the bare
// 'azure-openai' provider is only real when AZURE_OPENAI_API_KEY is set — the
// ProviderManager otherwise registers it with a placeholder key that fails.)
function configuredProviders(): string[] {
  const set: string[] = [];
  if (process.env.AZURE_OPENAI_API_KEY) set.push('azure-openai');
  if (process.env.AZURE_OPENAI_SEARCH_API_KEY || process.env.AZURE_OPENAI_API_KEY) set.push('azure-openai-search');
  if (process.env.OPENAI_API_KEY || process.env.CHATGPT_SEARCH_API_KEY) set.push('chatgptsearch');
  if (process.env.PERPLEXITY_API_KEY) set.push('perplexity');
  if (process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY) set.push('google-gemini');
  if (process.env.DATAFORSEO_USERNAME && process.env.DATAFORSEO_PASSWORD) set.push('google-ai-overview');
  return set;
}

// Resolve the requested providers to ones that are actually configured. If none
// of the requested providers are available, fall back to the best configured
// text model so callers that hardcode a provider still work.
function resolveProviders(requested: string[]): string[] {
  const available = configuredProviders();
  const effective = (requested || []).filter((p) => available.includes(p));
  if (effective.length > 0) return effective;
  const preferred = ['chatgptsearch', 'google-gemini', 'azure-openai', 'perplexity'];
  const fallback = preferred.find((p) => available.includes(p));
  return fallback ? [fallback] : [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, providers = [], priority = 'medium', userId } = body;

    console.log('🚀 AI Query API Request:', {
      prompt: prompt?.substring(0, 100) + '...',
      providers,
      priority,
      userId,
      timestamp: new Date().toISOString()
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Map requested providers to whatever is actually configured.
    const effectiveProviders = resolveProviders(providers);
    console.log('🧩 ai-query providers:', { requested: providers, effective: effectiveProviders });

    // Create API request
    const apiRequest: APIRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prompt,
      providers: effectiveProviders,
      priority,
      userId,
      metadata: {
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(),
    };

    console.log('📝 Created API Request:', {
      id: apiRequest.id,
      providers: apiRequest.providers,
      priority: apiRequest.priority
    });

    // Execute request across providers
    console.log('⚡ Executing request across providers...');
    const result = await providerManager.executeRequest(apiRequest);

    console.log('✅ AI Query API Response:', {
      requestId: result.requestId,
      resultsCount: result.results?.length || 0,
      totalCost: result.totalCost,
      aggregatedDataKeys: Object.keys(result.aggregatedData || {}),
      completedAt: result.completedAt
    });

    return NextResponse.json({
      success: true,
      requestId: result.requestId,
      data: result.aggregatedData,
      results: result.results,
      totalCost: result.totalCost,
      completedAt: result.completedAt,
      // Add debug info to see in browser
      debug: {
        providersExecuted: result.results?.map(r => r.providerId) || [],
        serverLogs: "Check server console for detailed logs",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API Query Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get provider status
    const status = await providerManager.getProviderStatus();
    const availableProviders = providerManager.getAvailableProviders();

    return NextResponse.json({
      success: true,
      providers: availableProviders,
      status,
    });

  } catch (error) {
    console.error('Provider Status Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 