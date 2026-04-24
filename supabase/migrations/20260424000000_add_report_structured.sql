-- Migration: add report_structured column to profiles
-- Run manually via Supabase Dashboard → SQL Editor → paste & execute
-- Phase: Stage 2 Batch 1 — structured AI report output

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS report_structured JSONB NULL;

-- report_structured stores: { strength, pattern, favorable, unfavorable }
-- base_report (existing text column) continues to hold the markdown reading
-- Frontend detail page reads base_report only; dashboard (Stage 2 Batch 2) reads report_structured
