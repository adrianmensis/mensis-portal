-- CEOs get an executive-framed message (sales, time, cost — without replacing
-- anyone) rather than the operational one used for other roles.
update public.target_accounts
set winning_message = 'Gemelos digitales que escalan a tus mejores ejecutivos sin reemplazar a nadie: más ventas, ahorro de tiempo y menores costos operativos para toda la organización.'
where upper(coalesce(role, '')) like '%CEO%';
