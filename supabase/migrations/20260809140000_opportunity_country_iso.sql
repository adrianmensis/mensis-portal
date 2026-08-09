-- El país de la oportunidad pasa a ser un selector (mismo criterio que los
-- partners y las cuentas objetivo): se guarda el código ISO alpha-2, no el
-- nombre escrito a mano. Normaliza lo que ya estaba cargado como texto libre.
update public.opportunities
set country = case lower(trim(country))
  when 'bolivia'    then 'BO'
  when 'costa rica' then 'CR'
  when 'venezuela'  then 'VE'
  when 'mexico'     then 'MX'
  when 'méxico'     then 'MX'
  when 'colombia'   then 'CO'
  when 'argentina'  then 'AR'
  when 'chile'      then 'CL'
  when 'peru'       then 'PE'
  when 'perú'       then 'PE'
  when 'ecuador'    then 'EC'
  when 'españa'     then 'ES'
  when 'espana'     then 'ES'
  when 'el salvador' then 'SV'
  when 'guatemala'  then 'GT'
  when 'honduras'   then 'HN'
  when 'nicaragua'  then 'NI'
  when 'panama'     then 'PA'
  when 'panamá'     then 'PA'
  when 'uruguay'    then 'UY'
  when 'paraguay'   then 'PY'
  when 'brasil'     then 'BR'
  when 'brazil'     then 'BR'
  when 'republica dominicana'  then 'DO'
  when 'república dominicana'  then 'DO'
  when 'estados unidos' then 'US'
  else country
end
where country is not null and length(trim(country)) <> 2;
