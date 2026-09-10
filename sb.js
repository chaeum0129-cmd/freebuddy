// FreeBuddy - Supabase 공통 설정
var FREEBUDDY_SB_URL = 'https://hlyxoibjbgrzenojrpbn.supabase.co';
var FREEBUDDY_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseXhvaWJqYmdyemVub2pycGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MzY5NjgsImV4cCI6MjEwNDQxMjk2OH0.9NvqzszqoxYMN7uhGyyGtEXBtA0IF3ph-rRuUxahP2A';

function getSB() {
  return window.supabase.createClient(FREEBUDDY_SB_URL, FREEBUDDY_SB_KEY);
}
