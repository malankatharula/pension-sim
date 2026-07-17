insert into public.app_config (key, value, description) values
  ('default_starting_age',          '25',     'Default age shown in wizard step 1'),
  ('default_retirement_age',        '50',     'Default retirement age'),
  ('default_rate_conservative',     '0.0600', 'Conservative annual FD rate (decimal)'),
  ('default_rate_optimistic',       '0.1000', 'Optimistic annual FD rate (decimal)'),
  ('default_rate_fd_lock',          '0.1200', 'FD corpus lock rate — dual vehicle model'),
  ('default_rate_liquid',           '0.0900', 'Liquid savings track rate — dual vehicle model'),
  ('default_inflation_rate',        '0.0890', 'Long-run inflation baseline (10-yr Sri Lanka avg)'),
  ('default_wht_rate',              '0.0500', 'Withholding tax on interest income'),
  ('default_mc_iterations',         '5000',   'Monte Carlo iteration count'),
  ('default_mc_mu',                 '0.1000', 'Vasicek mean rate for MC'),
  ('default_mc_sigma',              '0.0250', 'Vasicek sigma (rate volatility) for MC'),
  ('default_mc_kappa',              '0.3000', 'Vasicek mean-reversion speed'),
  ('default_mc_rate_floor',         '0.0400', 'Minimum rate floor in MC simulation'),
  ('default_payment_p1',            '25000',  'Default monthly savings — Period 1'),
  ('default_payment_p2',            '35000',  'Default monthly savings — Period 2'),
  ('default_payment_p3',            '45000',  'Default monthly savings — Period 3'),
  ('default_payment_p4',            '55000',  'Default monthly savings — Period 4'),
  ('default_payment_p5',            '65000',  'Default monthly savings — Period 5'),
  ('currency_symbol',               'LKR',    'Currency prefix for display'),
  ('app_version_banner',            '',       'Optional banner text shown on home screen. Leave empty to hide.'),
  ('fd_rates_last_updated',         '',       'Date string shown on FD Rate Explorer e.g. "June 2026"')
on conflict (key) do nothing;

insert into public.fd_rates (bank_name, term_months, rate, min_amount, notes) values
  ('National Savings Bank (NSB)', 60, 0.1200, 10000, 'Government-backed, no SLDIS cap'),
  ('Bank of Ceylon', 60, 0.1350, 10000, 'Largest state bank'),
  ('Commercial Bank', 60, 0.1300, 25000, 'Highest-rated private bank'),
  ('HNB', 60, 0.1275, 10000, 'Strong private sector option'),
  ('Seylan Bank', 60, 0.1400, 10000, 'Competitive 5-year rate'),
  ('People''s Bank', 60, 0.1325, 10000, 'State-owned, SLDIS insured'),
  ('National Savings Bank (NSB)', 12, 0.1000, 10000, 'Shorter-term liquidity option'),
  ('Commercial Bank', 12, 0.1050, 25000, '1-year term'),
  ('Seylan Bank', 12, 0.1150, 10000, '1-year term');