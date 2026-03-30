/**
 * Simple test Worker - just returns success
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', worker: 'watermark-worker' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    if (path === '/api/add-watermark' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
        
        // Get the file data
        const arrayBuffer = await file.arrayBuffer();
        
        // Just return the same image for testing
        return new Response(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Disposition': 'attachment; filename="watermarked.jpg"',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
