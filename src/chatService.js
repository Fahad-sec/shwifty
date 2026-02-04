export const chatService =  {
  send: async (supabaseClient, messageText) => {
     const {error} = await supabaseClient
     .from('messages')
     .insert([{content: messageText}]);

     if (error) console.error(error)
  },

  getHistory: async (supabaseClient) => {
    const {data, error} = await supabaseClient
    .from('messages')
    .select('*')
    .order('created_at', {accending: true})
    if (error) {
      console.error('history error: ', error);
      return[];
    }
    return data;
  }
}

