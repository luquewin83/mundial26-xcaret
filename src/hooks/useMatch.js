import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMatch(matchId) {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) {
      setLoading(false)
      return
    }

    const fetch = async () => {
      const { data } = await supabase.from('matches').select('*').eq('id', matchId).single()
      setMatch(data)
      setLoading(false)
    }
    fetch()

    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        (payload) => setMatch(payload.new),
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [matchId])

  return { match, loading }
}
