export const chatService =  {
  send: async (supabaseClient, messageText, username) => {
     const {error} = await supabaseClient
     .from('messages')
     .insert([{
      content: messageText,
      username: username
    }]);

     if (error) console.error(error)
  },

  getHistory: async (supabaseClient) => {
    const {data, error} = await supabaseClient
    .from('messages')
    .select('*')
    .order('created_at', {ascending: true})
    if (error) {
      console.error('history error: ', error);
      return[];
    }
    return data;
  }
}

