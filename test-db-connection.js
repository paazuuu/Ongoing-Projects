#!/usr/bin/env node
/**
 * データベース接続テスト用スクリプト
 * Supabaseへの接続確認とPrismaクライアントの動作確認
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔄 データベース接続テスト開始...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 基本接続テスト
    console.log('1. 基本接続テスト...');
    await prisma.$connect();
    console.log('✅ データベース接続成功\n');
    
    // テーブル存在確認（各テーブルをカウント）
    console.log('2. テーブル存在確認...');
    
    const memberCount = await prisma.member.count();
    console.log(`✅ members テーブル: ${memberCount} 件`);
    
    const partnerCount = await prisma.externalPartner.count();
    console.log(`✅ external_partners テーブル: ${partnerCount} 件`);
    
    const projectCount = await prisma.project.count();
    console.log(`✅ projects テーブル: ${projectCount} 件`);
    
    const assignmentCount = await prisma.projectMemberAssignment.count();
    console.log(`✅ project_member_assignments テーブル: ${assignmentCount} 件`);
    
    const partnerAssignmentCount = await prisma.projectExternalPartnerAssignment.count();
    console.log(`✅ project_external_partner_assignments テーブル: ${partnerAssignmentCount} 件\n`);
    
    // サンプルデータの確認（最初の1件を取得）
    console.log('3. サンプルデータ確認...');
    
    const firstMember = await prisma.member.findFirst();
    if (firstMember) {
      console.log('✅ 最初のメンバー:', {
        id: firstMember.id,
        name: firstMember.name,
        team: firstMember.team
      });
    } else {
      console.log('ℹ️  メンバーデータなし');
    }
    
    const firstProject = await prisma.project.findFirst();
    if (firstProject) {
      console.log('✅ 最初のプロジェクト:', {
        id: firstProject.id,
        name: firstProject.name,
        date: firstProject.date
      });
    } else {
      console.log('ℹ️  プロジェクトデータなし');
    }
    
    console.log('\n🎉 データベース接続テスト完了！');
    console.log('✅ PlanetScale → Supabase移行成功');
    
  } catch (error) {
    console.error('❌ エラー発生:', error.message);
    console.error('\n⚠️  チェックポイント:');
    console.error('- DATABASE_URL環境変数が正しく設定されているか');
    console.error('- Supabaseプロジェクトが正常に動作しているか');
    console.error('- マイグレーションが正常に適用されているか');
    
    if (error.code === 'P1001') {
      console.error('\n💡 ヒント: データベース接続エラーです');
      console.error('   .envファイルのDATABASE_URLを確認してください');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// 環境変数チェック
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL環境変数が設定されていません');
  console.error('💡 .envファイルを作成し、DATABASE_URLを設定してください');
  console.error('\n例:');
  console.error('DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"');
  process.exit(1);
}

testConnection()
  .catch((error) => {
    console.error('予期しないエラー:', error);
    process.exit(1);
  });