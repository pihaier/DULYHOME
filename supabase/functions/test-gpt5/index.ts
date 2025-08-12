import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    const openai = new OpenAI({ apiKey: openaiApiKey })
    
    // Test simple GPT-5-mini call
    console.log('Testing GPT-5-mini...')
    
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "user",
          content: "Reply with just the number 96"
        }
      ],
      max_completion_tokens: 50,  // Increase token limit
      reasoning_effort: "minimal"  // Use minimal reasoning
    })
    
    const content = response.choices[0]?.message?.content || ''
    console.log('GPT-5-mini response:', content)
    
    return new Response(
      JSON.stringify({
        success: true,
        model: response.model,
        content: content,
        usage: response.usage,
        full_response: response
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.response?.data || error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})