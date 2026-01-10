-- Add deliverables column to campaigns table
alter table campaigns 
add column if not exists deliverables jsonb default '[]'::jsonb;

-- Add comment describing the structure
comment on column campaigns.deliverables is 'Array of strings describing required deliverables for the campaign';
