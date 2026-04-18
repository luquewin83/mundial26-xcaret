import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useRanking(matchId) {
  const [ranking, setRanking] = useState([])

  const fetch = useCallback(async () => {
    if (!matchId) return

    const { data } = await supabase
      .from('predictions')
      .select('guest_id, points_earned, guests(name, room_number)')
      .eq('match_id', matchId)
      .not('points_earned', 'is', null)

    if (!data) return

    const map = {}
    data.forEach((p) => {
      if (!map[p.guest_id]) {
        map[p.guest_id] = {
          guest_id: p.guest_id,
          name: p.guests?.name ?? 'Anónimo',
          room_number: p.guests?.room_number ?? '–',
          total: 0,
        }
      }
      map[p.guest_id].total += p.points_earned ?? 0
    })

    setRanking(Object.values(map).sort((a, b) => b.total - a.total))
  }, [matchId])

  useEffect(() => {
    fetch()

    const channel = supabase
      .channel(`ranking:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'predictions', filter: `match_id=eq.${matchId}` },
        () => fetch(),
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [matchId, fetch])

  return ranking
}
