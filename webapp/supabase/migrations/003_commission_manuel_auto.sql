-- La "balance" devient un report automatique (balance totale du jour precedent),
-- plus besoin du champ "charges" : seul "commission" reste saisi manuellement.
alter table commission_manuel drop column if exists charges;
alter table commission_manuel rename column balance to balance_total;
