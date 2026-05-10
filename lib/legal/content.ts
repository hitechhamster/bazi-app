export type Locale = 'en' | 'zh-CN' | 'zh-TW'
export type LegalDoc = 'privacy' | 'terms' | 'disclaimer'

export const LEGAL_META = {
  companyName: 'Bazi Master',
  effectiveDate: '2026-05-10',
  contactEmail: 'contact@bazi-master.com',
  jurisdiction: '[TBD]',
} as const

export type Section = { heading: string; body: string[] }

export type LegalEntry = {
  title: string
  lastUpdatedLabel: string
  sections: Section[]
}

export const LEGAL_CONTENT: Record<LegalDoc, Record<Locale, LegalEntry>> = {

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVACY POLICY
  // ─────────────────────────────────────────────────────────────────────────
  privacy: {
    en: {
      title: 'Privacy Policy',
      lastUpdatedLabel: 'Last updated',
      sections: [
        {
          heading: '1. Introduction',
          body: [
            'Bazi Master ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and the choices you have regarding your information when you use our service at bazi-master.com.',
            'By using Bazi Master, you agree to the collection and use of information in accordance with this policy.',
          ],
        },
        {
          heading: '2. Information We Collect',
          body: [
            'We collect the following categories of information:',
            'Account information: your email address, collected when you register or sign in via email magic link or Google OAuth.',
            'Birth data: date of birth, time of birth, and place of birth that you voluntarily enter to generate a Bazi chart. This data is the core input of the service.',
            'Profile names: names or labels you assign to profiles (including profiles for other people, entered with their consent).',
            'AI conversation history: messages you send and responses generated during multi-turn AI conversations within the service.',
            'Usage data: standard server logs including IP address, browser type, pages visited, and timestamps, collected automatically.',
          ],
        },
        {
          heading: '3. How We Use Your Information',
          body: [
            'We use the information we collect for the following purposes:',
            'Authentication and account management: to verify your identity and maintain your session.',
            'Service delivery: to calculate your Bazi chart, generate AI-powered readings and daily almanac entries, and respond to your questions within the chat feature.',
            'Service improvement: to understand how users interact with Bazi Master and to improve reliability, performance, and features.',
            'Customer support: to respond to inquiries and resolve issues you report.',
            'We do not sell your personal data to third parties.',
          ],
        },
        {
          heading: '4. Third-Party Services',
          body: [
            'Bazi Master relies on the following third-party services to operate. Each has its own privacy policy:',
            'Supabase — database storage, authentication, and infrastructure. Your account data and profile data are stored in Supabase-managed databases.',
            'Google Gemini — AI inference engine used to generate Bazi readings, daily almanac content, and chat responses. Your birth data and conversation content may be sent to Google\'s API for processing.',
            'Google OAuth — optional sign-in method. If you choose to sign in with Google, Google shares your email address with us.',
            'Resend — transactional email delivery (magic link emails, account confirmation emails).',
            'Vercel — cloud hosting and edge network. All web traffic passes through Vercel\'s infrastructure.',
            'We encourage you to review the privacy policies of these providers.',
          ],
        },
        {
          heading: '5. Cookies & Sessions',
          body: [
            'Bazi Master uses session cookies to maintain your authenticated state. Specifically, Supabase sets cookies prefixed with sb- (e.g., sb-[project]-auth-token) to store your session token securely in your browser.',
            'These cookies are strictly necessary for the service to function. We do not use advertising cookies or cross-site tracking cookies.',
          ],
        },
        {
          heading: '6. Data Retention',
          body: [
            'We retain your data for as long as your account remains active. If you request account deletion, we will delete or anonymise your personal data within 30 days of the request, except where we are required to retain it for legal or compliance reasons.',
            'To request deletion of your account and associated data, contact us at contact@bazi-master.com.',
          ],
        },
        {
          heading: '7. International Data Transfers',
          body: [
            'Bazi Master is hosted on infrastructure that may be located in multiple regions, including the Asia-Pacific region. By using our service, you acknowledge that your data may be transferred to and processed in countries outside your country of residence, which may have different data protection laws.',
            'We take reasonable steps to ensure that such transfers comply with applicable data protection requirements.',
          ],
        },
        {
          heading: '8. Your Rights',
          body: [
            'Depending on your location, you may have the following rights regarding your personal data:',
            'Access: request a copy of the personal data we hold about you.',
            'Correction: request correction of inaccurate or incomplete data.',
            'Deletion: request erasure of your personal data ("right to be forgotten").',
            'Portability: request your data in a structured, machine-readable format.',
            'To exercise any of these rights, please contact us at contact@bazi-master.com. We will respond within a reasonable timeframe.',
          ],
        },
        {
          heading: '9. Children\'s Privacy',
          body: [
            'Bazi Master is not intended for users under the age of 16. We do not knowingly collect personal information from children under 16. If you believe a child has provided us with personal information, please contact us and we will promptly delete it.',
          ],
        },
        {
          heading: '10. Changes to This Policy',
          body: [
            'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. For material changes, we will make reasonable efforts to notify you, such as by email or a prominent notice within the service.',
            'Your continued use of Bazi Master after any changes constitutes your acceptance of the updated policy.',
          ],
        },
        {
          heading: '11. Contact Us',
          body: [
            'If you have any questions about this Privacy Policy or our data practices, please contact us at: contact@bazi-master.com',
          ],
        },
      ],
    },

    'zh-CN': {
      title: '隐私政策',
      lastUpdatedLabel: '最后更新',
      sections: [
        {
          heading: '1. 简介',
          body: [
            'Bazi Master（"我们"）致力于保护您的个人信息。本隐私政策说明我们在您使用 bazi-master.com 服务时收集哪些数据、如何使用这些数据，以及您对自身信息的选择权。',
            '使用 Bazi Master 即表示您同意按照本政策收集和使用相关信息。',
          ],
        },
        {
          heading: '2. 我们收集的信息',
          body: [
            '我们收集以下类别的信息：',
            '账户信息：您注册或通过邮件魔法链接、Google OAuth 登录时提供的电子邮箱地址。',
            '出生数据：您自愿填写的出生日期、出生时间和出生地点，这是生成八字命盘的核心输入。',
            '档案名称：您为命盘档案设置的姓名或标签（包括经当事人同意后为他人创建的档案）。',
            'AI 对话历史：您在多轮 AI 对话功能中发送的消息及 AI 生成的回复内容。',
            '使用数据：服务器自动记录的标准日志，包括 IP 地址、浏览器类型、访问页面和时间戳。',
          ],
        },
        {
          heading: '3. 我们如何使用您的信息',
          body: [
            '我们将收集的信息用于以下目的：',
            '身份验证与账户管理：用于核实您的身份并维持登录状态。',
            '服务提供：用于计算八字命盘、生成 AI 解读报告和日课，以及在对话功能中回答您的提问。',
            '服务改进：了解用户如何使用 Bazi Master，以提升可靠性、性能和功能。',
            '客户支持：回应您提出的问题并处理您反馈的问题。',
            '我们不会将您的个人数据出售给第三方。',
          ],
        },
        {
          heading: '4. 第三方服务',
          body: [
            'Bazi Master 依赖以下第三方服务运营，各方均有独立的隐私政策：',
            'Supabase — 数据库存储、身份验证及基础设施。您的账户数据和档案数据存储于 Supabase 管理的数据库中。',
            'Google Gemini — AI 推理引擎，用于生成八字解读、日课内容及对话回复。您的出生数据和对话内容可能会被发送至 Google API 进行处理。',
            'Google OAuth — 可选登录方式。若您选择使用 Google 登录，Google 会将您的电子邮箱地址共享给我们。',
            'Resend — 事务性邮件服务（魔法链接邮件、账户确认邮件）。',
            'Vercel — 云端托管与边缘网络。所有网络流量均经由 Vercel 基础设施传输。',
            '建议您查阅上述各服务商的隐私政策。',
          ],
        },
        {
          heading: '5. Cookie 与会话',
          body: [
            'Bazi Master 使用会话 Cookie 维持您的登录状态。具体而言，Supabase 会在您的浏览器中设置以 sb- 为前缀的 Cookie（例如 sb-[项目名]-auth-token），用于安全存储会话令牌。',
            '这些 Cookie 是服务正常运行所必需的，我们不使用广告 Cookie 或跨站追踪 Cookie。',
          ],
        },
        {
          heading: '6. 数据保留',
          body: [
            '我们在您的账户有效期间保留您的数据。若您请求注销账户，我们将在收到请求后 30 天内删除或匿名化您的个人数据，法律或合规要求保留的数据除外。',
            '如需申请删除账户及相关数据，请通过 contact@bazi-master.com 联系我们。',
          ],
        },
        {
          heading: '7. 国际数据传输',
          body: [
            'Bazi Master 托管的基础设施可能位于多个地区，包括亚太地区。使用本服务即表示您了解并同意，您的数据可能被传输至您所在国家以外的地区进行处理，相关国家的数据保护法律可能与您所在地有所不同。',
            '我们将采取合理措施，确保此类数据传输符合适用的数据保护要求。',
          ],
        },
        {
          heading: '8. 您的权利',
          body: [
            '根据您所在地区的法律，您可能对自己的个人数据享有以下权利：',
            '访问权：请求查看我们持有的有关您的个人数据副本。',
            '更正权：请求更正不准确或不完整的数据。',
            '删除权：请求删除您的个人数据（"被遗忘权"）。',
            '数据可携权：请求以结构化、机器可读的格式获取您的数据。',
            '如需行使上述任何权利，请通过 contact@bazi-master.com 联系我们，我们将在合理时间内予以回复。',
          ],
        },
        {
          heading: '9. 未成年人隐私',
          body: [
            'Bazi Master 不面向 16 岁以下的用户。我们不会有意收集 16 岁以下儿童的个人信息。如果您认为儿童已向我们提供个人信息，请联系我们，我们将及时予以删除。',
          ],
        },
        {
          heading: '10. 政策变更',
          body: [
            '我们可能会不时更新本隐私政策。更新时，我们将修改本页顶部的"最后更新"日期。对于重大变更，我们将通过合理方式通知您，例如发送电子邮件或在服务内发布醒目公告。',
            '在政策更新后继续使用 Bazi Master，即视为您接受更新后的政策。',
          ],
        },
        {
          heading: '11. 联系我们',
          body: [
            '如对本隐私政策或我们的数据处理方式有任何疑问，请通过以下方式联系我们：contact@bazi-master.com',
          ],
        },
      ],
    },

    'zh-TW': {
      title: '隱私政策',
      lastUpdatedLabel: '最後更新',
      sections: [
        {
          heading: '1. 簡介',
          body: [
            'Bazi Master（「我們」）致力於保護您的個人資訊。本隱私政策說明我們在您使用 bazi-master.com 服務時收集哪些資料、如何使用這些資料，以及您對自身資訊的選擇權。',
            '使用 Bazi Master 即表示您同意按照本政策收集和使用相關資訊。',
          ],
        },
        {
          heading: '2. 我們收集的資訊',
          body: [
            '我們收集以下類別的資訊：',
            '帳戶資訊：您註冊或透過信箱魔法連結、Google OAuth 登入時提供的電子信箱地址。',
            '出生資料：您自願填寫的出生日期、出生時間與出生地點，這是生成八字命盤的核心輸入。',
            '檔案名稱：您為命盤檔案設定的姓名或標籤（包括經當事人同意後為他人建立的檔案）。',
            'AI 對話歷史：您在多輪 AI 對話功能中傳送的訊息及 AI 生成的回覆內容。',
            '使用資料：伺服器自動記錄的標準日誌，包括 IP 位址、瀏覽器類型、瀏覽頁面與時間戳記。',
          ],
        },
        {
          heading: '3. 我們如何使用您的資訊',
          body: [
            '我們將收集的資訊用於以下目的：',
            '身份驗證與帳戶管理：用於核實您的身份並維持登入狀態。',
            '服務提供：用於計算八字命盤、生成 AI 解讀報告和日課，以及在對話功能中回答您的提問。',
            '服務改善：了解用戶如何使用 Bazi Master，以提升可靠性、效能與功能。',
            '客戶支援：回應您提出的問題並處理您反映的事項。',
            '我們不會將您的個人資料出售給第三方。',
          ],
        },
        {
          heading: '4. 第三方服務',
          body: [
            'Bazi Master 依賴以下第三方服務運營，各方均有獨立的隱私政策：',
            'Supabase — 資料庫儲存、身份驗證及基礎設施。您的帳戶資料與檔案資料儲存於 Supabase 管理的資料庫中。',
            'Google Gemini — AI 推理引擎，用於生成八字解讀、日課內容及對話回覆。您的出生資料與對話內容可能會被傳送至 Google API 進行處理。',
            'Google OAuth — 可選登入方式。若您選擇使用 Google 登入，Google 會將您的電子信箱地址分享給我們。',
            'Resend — 事務性郵件服務（魔法連結信件、帳戶確認信件）。',
            'Vercel — 雲端託管與邊緣網路。所有網路流量均經由 Vercel 基礎設施傳輸。',
            '建議您查閱上述各服務商的隱私政策。',
          ],
        },
        {
          heading: '5. Cookie 與工作階段',
          body: [
            'Bazi Master 使用工作階段 Cookie 維持您的登入狀態。具體而言，Supabase 會在您的瀏覽器中設定以 sb- 為前綴的 Cookie（例如 sb-[專案名]-auth-token），用於安全儲存工作階段權杖。',
            '這些 Cookie 是服務正常運作所必需的，我們不使用廣告 Cookie 或跨站追蹤 Cookie。',
          ],
        },
        {
          heading: '6. 資料保留',
          body: [
            '我們在您的帳戶有效期間保留您的資料。若您要求刪除帳戶，我們將在收到請求後 30 天內刪除或匿名化您的個人資料，法律或合規要求保留的資料除外。',
            '如需申請刪除帳戶及相關資料，請透過 contact@bazi-master.com 聯繫我們。',
          ],
        },
        {
          heading: '7. 國際資料傳輸',
          body: [
            'Bazi Master 託管的基礎設施可能位於多個地區，包括亞太地區。使用本服務即表示您了解並同意，您的資料可能被傳輸至您所在國家以外的地區進行處理，相關國家的資料保護法規可能與您所在地有所不同。',
            '我們將採取合理措施，確保此類資料傳輸符合適用的資料保護要求。',
          ],
        },
        {
          heading: '8. 您的權利',
          body: [
            '根據您所在地區的法律，您可能對自己的個人資料享有以下權利：',
            '查閱權：請求查看我們持有的有關您的個人資料副本。',
            '更正權：請求更正不正確或不完整的資料。',
            '刪除權：請求刪除您的個人資料（「被遺忘權」）。',
            '資料可攜權：請求以結構化、機器可讀的格式取得您的資料。',
            '如需行使上述任何權利，請透過 contact@bazi-master.com 聯繫我們，我們將在合理時間內予以回覆。',
          ],
        },
        {
          heading: '9. 未成年人隱私',
          body: [
            'Bazi Master 不面向 16 歲以下的用戶。我們不會有意收集 16 歲以下兒童的個人資訊。如果您認為兒童已向我們提供個人資訊，請聯繫我們，我們將立即予以刪除。',
          ],
        },
        {
          heading: '10. 政策變更',
          body: [
            '我們可能會不時更新本隱私政策。更新時，我們將修改本頁頂部的「最後更新」日期。對於重大變更，我們將透過合理方式通知您，例如發送電子郵件或在服務內發佈醒目公告。',
            '在政策更新後繼續使用 Bazi Master，即視為您接受更新後的政策。',
          ],
        },
        {
          heading: '11. 聯繫我們',
          body: [
            '如對本隱私政策或我們的資料處理方式有任何疑問，請透過以下方式聯繫我們：contact@bazi-master.com',
          ],
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TERMS OF SERVICE
  // ─────────────────────────────────────────────────────────────────────────
  terms: {
    en: {
      title: 'Terms of Service',
      lastUpdatedLabel: 'Last updated',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          body: [
            'By accessing or using Bazi Master ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.',
            'These Terms constitute a legally binding agreement between you and Bazi Master. We reserve the right to update these Terms at any time.',
          ],
        },
        {
          heading: '2. Eligibility',
          body: [
            'You must be at least 16 years of age to use Bazi Master. By using the Service, you represent and warrant that you meet this age requirement.',
            'If you are using the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.',
          ],
        },
        {
          heading: '3. Accounts and Security',
          body: [
            'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
            'You agree to notify us immediately at contact@bazi-master.com if you suspect any unauthorised use of your account.',
            'We reserve the right to suspend or terminate accounts that violate these Terms or that we believe pose a security risk.',
          ],
        },
        {
          heading: '4. Acceptable Use',
          body: [
            'You agree not to use the Service to:',
            'Upload or transmit any content that is unlawful, harmful, threatening, abusive, defamatory, or otherwise objectionable.',
            'Attempt to gain unauthorised access to any part of the Service or its related systems.',
            'Use automated tools, bots, or scrapers to extract data from the Service without our prior written consent.',
            'Impersonate any person or entity or misrepresent your affiliation with any person or entity.',
            'Violate any applicable local, national, or international law or regulation.',
          ],
        },
        {
          heading: '5. Intellectual Property',
          body: [
            'The Service and its original content, features, and functionality — including but not limited to the Bazi calculation engine, AI-generated report templates, and user interface design — are owned by Bazi Master and are protected by applicable intellectual property laws.',
            'Your input data (birth information, questions, and other content you submit) remains yours. By submitting content to the Service, you grant us a non-exclusive, worldwide, royalty-free licence to process and use that content solely for the purpose of providing the Service to you.',
            'AI-generated content (Bazi readings, daily almanac entries, chat responses) is provided for your personal, non-commercial use. You may save or share such content for personal purposes, but may not resell or redistribute it as a standalone product.',
          ],
        },
        {
          heading: '6. Subscriptions and Payments',
          body: [
            'Paid features will be introduced in the future. Specific plans, billing cycles, and refund policies will be detailed at launch and incorporated into these Terms.',
            'We will notify existing users with reasonable advance notice before any paid features are introduced.',
          ],
        },
        {
          heading: '7. Cancellation and Termination',
          body: [
            'You may stop using the Service at any time. To request deletion of your account and associated data, contact us at contact@bazi-master.com.',
            'We reserve the right to suspend or terminate your access to the Service at our discretion, including for violation of these Terms, without prior notice.',
            'Upon termination, your right to use the Service ceases immediately.',
          ],
        },
        {
          heading: '8. Disclaimers',
          body: [
            'The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied.',
            'Bazi Master content is intended for cultural exploration and personal reflection only. It does not constitute professional advice of any kind. Please refer to our Disclaimer page for the full disclaimer applicable to all content generated by this Service.',
          ],
        },
        {
          heading: '9. Limitation of Liability',
          body: [
            'To the fullest extent permitted by applicable law, Bazi Master and its affiliates, officers, employees, agents, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, arising out of or in connection with your use of or inability to use the Service.',
            'Our total liability to you for any claims arising under these Terms shall not exceed the greater of the amount you paid us in the twelve months preceding the claim, or USD $10.',
          ],
        },
        {
          heading: '10. Indemnification',
          body: [
            'You agree to indemnify and hold harmless Bazi Master and its affiliates, officers, agents, and employees from any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising out of your use of the Service, your violation of these Terms, or your violation of any rights of a third party.',
          ],
        },
        {
          heading: '11. Changes to These Terms',
          body: [
            'We reserve the right to modify these Terms at any time. We will notify you of material changes by updating the "Last updated" date and, where appropriate, by email or in-app notice.',
            'Your continued use of the Service after changes take effect constitutes your acceptance of the updated Terms.',
          ],
        },
        {
          heading: '12. Governing Law',
          body: [
            'These Terms are governed by the laws of [TBD jurisdiction], without regard to its conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of [TBD jurisdiction].',
          ],
        },
        {
          heading: '13. Contact',
          body: [
            'For any questions regarding these Terms, please contact us at: contact@bazi-master.com',
          ],
        },
      ],
    },

    'zh-CN': {
      title: '服务条款',
      lastUpdatedLabel: '最后更新',
      sections: [
        {
          heading: '1. 接受条款',
          body: [
            '访问或使用 Bazi Master（"本服务"）即表示您同意受本服务条款（"条款"）约束。如您不同意本条款，请勿使用本服务。',
            '本条款构成您与 Bazi Master 之间具有法律约束力的协议。我们保留随时更新本条款的权利。',
          ],
        },
        {
          heading: '2. 使用资格',
          body: [
            '您须年满 16 周岁方可使用 Bazi Master。使用本服务即表示您声明并保证您已达到上述年龄要求。',
            '如您代表某组织使用本服务，您声明您有权代表该组织接受本条款的约束。',
          ],
        },
        {
          heading: '3. 账户与安全',
          body: [
            '您有责任维护账户凭据的保密性，并对在您账户下发生的所有活动负责。',
            '如您怀疑账户遭到未经授权的使用，请立即通过 contact@bazi-master.com 通知我们。',
            '我们保留暂停或终止违反本条款或我们认为构成安全风险的账户的权利。',
          ],
        },
        {
          heading: '4. 可接受使用',
          body: [
            '您同意不使用本服务从事以下行为：',
            '上传或传输任何违法、有害、威胁性、辱骂性、诽谤性或其他令人反感的内容。',
            '尝试未经授权访问本服务的任何部分或其相关系统。',
            '在未经我们事先书面同意的情况下，使用自动化工具、机器人或爬虫从本服务提取数据。',
            '冒充任何个人或实体，或虚假陈述您与任何个人或实体的关系。',
            '违反任何适用的地方、国家或国际法律法规。',
          ],
        },
        {
          heading: '5. 知识产权',
          body: [
            '本服务及其原创内容、功能——包括但不限于八字计算引擎、AI 生成报告模板和界面设计——归 Bazi Master 所有，受适用知识产权法律保护。',
            '您提交的输入数据（出生信息、问题及您提交的其他内容）归您所有。提交内容即表示您授予我们一项非独占、全球范围、免版税的许可，仅用于向您提供本服务之目的对该内容进行处理和使用。',
            'AI 生成的内容（八字解读、日课内容、对话回复）供您个人、非商业使用。您可出于个人目的保存或分享此类内容，但不得将其作为独立产品转售或再分发。',
          ],
        },
        {
          heading: '6. 订阅与付费',
          body: [
            '付费功能将于未来推出。具体套餐、计费周期及退款政策将在正式发布时详细说明，并纳入本条款。',
            '在推出任何付费功能前，我们将提前以合理方式通知现有用户。',
          ],
        },
        {
          heading: '7. 注销与终止',
          body: [
            '您可随时停止使用本服务。如需申请注销账户及删除相关数据，请通过 contact@bazi-master.com 联系我们。',
            '我们保留自行决定暂停或终止您对本服务访问权的权利，包括因违反本条款，且无需事先通知。',
            '终止后，您使用本服务的权利立即停止。',
          ],
        },
        {
          heading: '8. 免责声明',
          body: [
            '本服务以"现状"和"可用性"为基础提供，不附带任何明示或暗示的保证。',
            'Bazi Master 的内容仅供文化探索和个人思考，不构成任何形式的专业建议。适用于本服务所有生成内容的完整免责声明，请参阅我们的免责声明页面。',
          ],
        },
        {
          heading: '9. 责任限制',
          body: [
            '在适用法律允许的最大范围内，Bazi Master 及其关联方、高管、员工、代理人和许可方不对因您使用或无法使用本服务而引起的任何间接、附带、特殊、后果性或惩罚性损害承担责任，包括但不限于利润损失、数据丢失、商誉损失或其他无形损失。',
            '就您依据本条款提出的任何索赔，我们对您的总赔偿责任不超过您在索赔发生前十二个月内向我们支付的金额，或 10 美元（取较高者）。',
          ],
        },
        {
          heading: '10. 赔偿',
          body: [
            '您同意就因您使用本服务、违反本条款或侵犯第三方权利而产生的任何索赔、损害、损失、责任及费用（包括合理律师费），对 Bazi Master 及其关联方、高管、代理人和员工进行赔偿并使其免受损害。',
          ],
        },
        {
          heading: '11. 条款变更',
          body: [
            '我们保留随时修改本条款的权利。对于重大变更，我们将通过更新"最后更新"日期，并酌情通过电子邮件或应用内通知告知您。',
            '变更生效后继续使用本服务，即视为您接受更新后的条款。',
          ],
        },
        {
          heading: '12. 适用法律',
          body: [
            '本条款受 [TBD 司法管辖区] 的法律管辖，不考虑其法律冲突原则。因本条款引发的任何争议，应提交 [TBD 司法管辖区] 法院专属管辖。',
          ],
        },
        {
          heading: '13. 联系我们',
          body: [
            '如对本条款有任何疑问，请通过以下方式联系我们：contact@bazi-master.com',
          ],
        },
      ],
    },

    'zh-TW': {
      title: '服務條款',
      lastUpdatedLabel: '最後更新',
      sections: [
        {
          heading: '1. 接受條款',
          body: [
            '存取或使用 Bazi Master（「本服務」）即表示您同意受本服務條款（「條款」）約束。如您不同意本條款，請勿使用本服務。',
            '本條款構成您與 Bazi Master 之間具有法律約束力的協議。我們保留隨時更新本條款的權利。',
          ],
        },
        {
          heading: '2. 使用資格',
          body: [
            '您須年滿 16 歲方可使用 Bazi Master。使用本服務即表示您聲明並保證您已達到上述年齡要求。',
            '如您代表某組織使用本服務，您聲明您有權代表該組織接受本條款的約束。',
          ],
        },
        {
          heading: '3. 帳戶與安全',
          body: [
            '您有責任維護帳戶憑證的保密性，並對在您帳戶下發生的所有活動負責。',
            '如您懷疑帳戶遭到未經授權的使用，請立即透過 contact@bazi-master.com 通知我們。',
            '我們保留暫停或終止違反本條款或我們認為構成安全風險的帳戶的權利。',
          ],
        },
        {
          heading: '4. 可接受使用',
          body: [
            '您同意不使用本服務從事以下行為：',
            '上傳或傳輸任何違法、有害、威脅性、辱罵性、誹謗性或其他令人反感的內容。',
            '嘗試未經授權存取本服務的任何部分或其相關系統。',
            '在未經我們事先書面同意的情況下，使用自動化工具、機器人或爬蟲從本服務提取資料。',
            '冒充任何個人或實體，或虛假陳述您與任何個人或實體的關係。',
            '違反任何適用的地方、國家或國際法律法規。',
          ],
        },
        {
          heading: '5. 智慧財產權',
          body: [
            '本服務及其原創內容、功能——包括但不限於八字計算引擎、AI 生成報告範本與介面設計——歸 Bazi Master 所有，受適用智慧財產權法律保護。',
            '您提交的輸入資料（出生資訊、問題及您提交的其他內容）歸您所有。提交內容即表示您授予我們一項非獨占、全球範圍、免版稅的授權，僅用於向您提供本服務之目的對該內容進行處理和使用。',
            'AI 生成的內容（八字解讀、日課內容、對話回覆）供您個人、非商業使用。您可出於個人目的儲存或分享此類內容，但不得將其作為獨立產品轉售或再散佈。',
          ],
        },
        {
          heading: '6. 訂閱與付費',
          body: [
            '付費功能將於未來推出。具體方案、計費週期及退款政策將在正式發布時詳細說明，並納入本條款。',
            '在推出任何付費功能前，我們將提前以合理方式通知現有用戶。',
          ],
        },
        {
          heading: '7. 取消與終止',
          body: [
            '您可隨時停止使用本服務。如需申請刪除帳戶及相關資料，請透過 contact@bazi-master.com 聯繫我們。',
            '我們保留自行決定暫停或終止您對本服務存取權的權利，包括因違反本條款，且無需事先通知。',
            '終止後，您使用本服務的權利立即停止。',
          ],
        },
        {
          heading: '8. 免責聲明',
          body: [
            '本服務以「現狀」和「可用性」為基礎提供，不附帶任何明示或暗示的保證。',
            'Bazi Master 的內容僅供文化探索與個人思考，不構成任何形式的專業建議。適用於本服務所有生成內容的完整免責聲明，請參閱我們的免責聲明頁面。',
          ],
        },
        {
          heading: '9. 責任限制',
          body: [
            '在適用法律允許的最大範圍內，Bazi Master 及其關聯方、高管、員工、代理人與授權方不對因您使用或無法使用本服務而引起的任何間接、附帶、特殊、後果性或懲罰性損害承擔責任，包括但不限於利潤損失、資料遺失、商譽損失或其他無形損失。',
            '就您依據本條款提出的任何索賠，我們對您的總賠償責任不超過您在索賠發生前十二個月內向我們支付的金額，或 10 美元（取較高者）。',
          ],
        },
        {
          heading: '10. 賠償',
          body: [
            '您同意就因您使用本服務、違反本條款或侵犯第三方權利而產生的任何索賠、損害、損失、責任及費用（包括合理律師費），對 Bazi Master 及其關聯方、高管、代理人與員工進行賠償並使其免受損害。',
          ],
        },
        {
          heading: '11. 條款變更',
          body: [
            '我們保留隨時修改本條款的權利。對於重大變更，我們將透過更新「最後更新」日期，並酌情透過電子郵件或應用程式內通知告知您。',
            '變更生效後繼續使用本服務，即視為您接受更新後的條款。',
          ],
        },
        {
          heading: '12. 適用法律',
          body: [
            '本條款受 [TBD 司法管轄區] 的法律管轄，不考慮其法律衝突原則。因本條款引發的任何爭議，應提交 [TBD 司法管轄區] 法院專屬管轄。',
          ],
        },
        {
          heading: '13. 聯繫我們',
          body: [
            '如對本條款有任何疑問，請透過以下方式聯繫我們：contact@bazi-master.com',
          ],
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DISCLAIMER
  // ─────────────────────────────────────────────────────────────────────────
  disclaimer: {
    en: {
      title: 'Disclaimer',
      lastUpdatedLabel: 'Last updated',
      sections: [
        {
          heading: '1. Nature of Our Service',
          body: [
            'Bazi Master provides Bazi (八字 / Four Pillars of Destiny) chart calculations and AI-generated interpretations based on traditional Chinese metaphysical frameworks. All content generated by this service — including but not limited to base readings, daily almanac entries, and multi-turn AI chat responses — is produced by artificial intelligence and is grounded in cultural and traditional interpretive systems, not empirical science.',
            'Bazi Master is designed for cultural exploration, self-reflection, and personal entertainment only.',
          ],
        },
        {
          heading: '2. Not Professional Advice',
          body: [
            'NOTHING on this platform constitutes, or should be construed as, professional advice of any kind. This includes, without limitation:',
            'Medical or health advice — content on this platform does not diagnose, treat, cure, or prevent any physical or mental health condition. Do not use this service in place of consultation with a licensed physician, psychiatrist, psychologist, or other qualified healthcare professional.',
            'Psychological or counselling advice — AI-generated content is not a substitute for therapy, counselling, or any form of mental health treatment.',
            'Legal advice — nothing on this platform creates an attorney-client relationship or constitutes legal counsel. Do not rely on content from this service for legal decisions.',
            'Financial or investment advice — content on this platform does not constitute investment advice, financial planning guidance, or a recommendation to buy or sell any asset, security, or financial instrument.',
            'Relationship or personal advice — interpretations of compatibility, relationship dynamics, or personal suitability are for reflective purposes only and should not be treated as authoritative guidance.',
          ],
        },
        {
          heading: '3. No Guarantee of Accuracy',
          body: [
            'The Bazi system is a traditional interpretive framework with centuries of cultural history. Like all systems of this nature, its outputs are inherently subjective and depend on the practitioner\'s or system\'s interpretive approach. There is no scientific consensus that Bazi or any related system can predict future events, personality traits, or life outcomes.',
            'AI-generated content may contain errors, inconsistencies, or omissions. The models underlying this service are probabilistic in nature and may produce different outputs for the same inputs across sessions.',
            'We make no representations or warranties, express or implied, regarding the accuracy, completeness, reliability, or suitability of any content generated by this service.',
          ],
        },
        {
          heading: '4. User Responsibility',
          body: [
            'You acknowledge and agree that all decisions you make — whether personal, medical, legal, financial, relational, or otherwise — are made at your sole discretion and are your sole responsibility.',
            'Bazi Master, its operators, employees, and affiliates shall not be held liable for any outcomes, consequences, losses, or damages, whether direct or indirect, that arise from your reliance on content generated by this service. This includes but is not limited to: financial loss, adverse health outcomes, relationship difficulties, legal consequences, or any other harm arising from actions taken or not taken based on content from Bazi Master.',
          ],
        },
        {
          heading: '5. Mental Health Notice',
          body: [
            'If you are currently experiencing emotional distress, a mental health crisis, thoughts of self-harm, or any related difficulties, please do not rely on this service for support.',
            'Please contact qualified mental health professionals or local crisis support resources in your area. These services are staffed by trained professionals who can provide the care and support you need.',
          ],
        },
        {
          heading: '6. Cultural and Educational Context',
          body: [
            'Bazi (Four Pillars of Destiny) is part of a rich tradition of Chinese cultural and philosophical thought. Bazi Master presents this tradition through the lens of AI interpretation as a means of cultural education and personal exploration.',
            'The system has not been validated by peer-reviewed scientific research. We present it as a culturally significant interpretive framework, not as a predictive or diagnostic tool. Users are encouraged to engage with this content critically and with an awareness of its traditional, cultural nature.',
          ],
        },
        {
          heading: '7. No Use for Major Life Decisions',
          body: [
            'You agree that you will not use Bazi Master as the sole or primary basis for any major life decision, including but not limited to:',
            'Medical decisions — including treatment choices, medication decisions, or decisions to seek or discontinue medical care.',
            'Legal decisions — including decisions related to contracts, disputes, litigation, or regulatory compliance.',
            'Financial decisions — including investment choices, major purchases, asset allocation, or retirement planning.',
            'Relationship decisions — including marriage, separation, custody arrangements, or decisions regarding significant personal relationships.',
            'Career or educational decisions — including major career changes, educational enrolment, or professional qualification choices.',
            'Any other decision where erroneous or unsuitable guidance could result in material harm to yourself or others.',
          ],
        },
        {
          heading: '8. Contact',
          body: [
            'If you have questions about this Disclaimer, please contact us at: contact@bazi-master.com',
          ],
        },
      ],
    },

    'zh-CN': {
      title: '免责声明',
      lastUpdatedLabel: '最后更新',
      sections: [
        {
          heading: '1. 服务性质',
          body: [
            'Bazi Master 基于中国传统命理学框架，提供八字（四柱）命盘计算和 AI 生成的解读内容。本服务生成的所有内容——包括但不限于基础解读报告、日课及多轮 AI 对话回复——均由人工智能生成，以传统文化解释体系为基础，而非实证科学。',
            'Bazi Master 仅供文化探索、个人思考和娱乐使用。',
          ],
        },
        {
          heading: '2. 非专业建议',
          body: [
            '本平台上的任何内容均不构成、也不应被视为任何形式的专业建议，包括但不限于：',
            '医疗或健康建议——本平台内容不对任何身体或心理健康状况进行诊断、治疗、治愈或预防。请勿以本服务代替执照医师、精神科医生、心理学家或其他合格医疗专业人员的诊疗。',
            '心理或咨询建议——AI 生成的内容不能替代心理治疗、咨询或任何形式的心理健康干预。',
            '法律建议——本平台任何内容均不构成律师-客户关系，也不构成法律顾问意见。请勿依据本服务内容做出法律决策。',
            '财务或投资建议——本平台内容不构成投资建议、财务规划指导，也不构成对任何资产、证券或金融工具的买卖建议。',
            '感情或个人建议——对合婚、感情关系或个人适配性的解读仅供参考，不应被视为权威性指导。',
          ],
        },
        {
          heading: '3. 不保证准确性',
          body: [
            '八字体系是一套拥有数百年文化历史的传统解释框架。与所有此类体系一样，其输出结果本质上具有主观性，取决于实践者或体系本身的解释方式。目前没有科学共识证明八字或任何相关体系能够预测未来事件、性格特征或人生结果。',
            'AI 生成的内容可能存在错误、不一致或遗漏。本服务所依赖的模型本质上是概率性的，对相同输入在不同会话中可能产生不同结果。',
            '我们不对本服务生成的任何内容的准确性、完整性、可靠性或适用性作出任何明示或暗示的陈述或保证。',
          ],
        },
        {
          heading: '4. 用户责任',
          body: [
            '您承认并同意，您所做出的一切决定——无论是个人、医疗、法律、财务、感情还是其他方面——均由您自主决定，并由您独自承担后果。',
            'Bazi Master 及其运营者、员工和关联方不对因您依赖本服务生成的内容而产生的任何结果、后果、损失或损害承担责任，无论是直接的还是间接的。这包括但不限于：财务损失、不良健康后果、感情困难、法律后果，或因根据 Bazi Master 内容采取或未采取行动而造成的任何其他损害。',
          ],
        },
        {
          heading: '5. 心理健康提示',
          body: [
            '如果您目前正经历情绪困扰、心理健康危机、自伤念头或任何相关困难，请勿依赖本服务寻求支持。',
            '请联系您所在地区的专业心理健康人员或危机支持资源。这些服务由经过培训的专业人员提供，能够给予您所需的关怀和支持。',
          ],
        },
        {
          heading: '6. 文化与教育背景',
          body: [
            '八字（四柱推命）是中国传统文化与哲学思想的重要组成部分。Bazi Master 通过 AI 解读的方式呈现这一传统，作为文化教育和个人探索的途径。',
            '该体系尚未经过同行评审的科学研究验证。我们将其作为一个具有重要文化价值的解释框架呈现，而非预测或诊断工具。我们鼓励用户以批判性眼光看待此类内容，并了解其传统文化属性。',
          ],
        },
        {
          heading: '7. 不得用于重大人生决策',
          body: [
            '您同意不将 Bazi Master 作为任何重大人生决策的唯一或主要依据，包括但不限于：',
            '医疗决策——包括治疗方案选择、用药决定，或寻求或停止医疗护理的决定。',
            '法律决策——包括与合同、纠纷、诉讼或监管合规相关的决定。',
            '财务决策——包括投资选择、重大购买、资产配置或退休规划。',
            '感情决策——包括婚姻、分离、监护安排，或涉及重要个人关系的决定。',
            '职业或教育决策——包括重大职业转变、入学报名或专业资格选择。',
            '任何其他因错误或不当指导可能对自身或他人造成实质性伤害的决策。',
          ],
        },
        {
          heading: '8. 联系我们',
          body: [
            '如对本免责声明有任何疑问，请通过以下方式联系我们：contact@bazi-master.com',
          ],
        },
      ],
    },

    'zh-TW': {
      title: '免責聲明',
      lastUpdatedLabel: '最後更新',
      sections: [
        {
          heading: '1. 服務性質',
          body: [
            'Bazi Master 基於中國傳統命理學框架，提供八字（四柱）命盤計算和 AI 生成的解讀內容。本服務生成的所有內容——包括但不限於基礎解讀報告、日課及多輪 AI 對話回覆——均由人工智慧生成，以傳統文化解釋體系為基礎，而非實證科學。',
            'Bazi Master 僅供文化探索、個人思考與娛樂使用。',
          ],
        },
        {
          heading: '2. 非專業建議',
          body: [
            '本平台上的任何內容均不構成、也不應被視為任何形式的專業建議，包括但不限於：',
            '醫療或健康建議——本平台內容不對任何身體或心理健康狀況進行診斷、治療、治癒或預防。請勿以本服務取代執照醫師、精神科醫師、心理師或其他合格醫療專業人員的診療。',
            '心理或諮商建議——AI 生成的內容不能取代心理治療、諮商或任何形式的心理健康介入。',
            '法律建議——本平台任何內容均不構成律師與當事人關係，也不構成法律顧問意見。請勿依據本服務內容做出法律決策。',
            '財務或投資建議——本平台內容不構成投資建議、財務規劃指導，也不構成對任何資產、有價證券或金融商品的買賣建議。',
            '感情或個人建議——對合婚、感情關係或個人適配性的解讀僅供參考，不應被視為權威性指導。',
          ],
        },
        {
          heading: '3. 不保證準確性',
          body: [
            '八字體系是一套擁有數百年文化歷史的傳統解釋框架。與所有此類體系一樣，其輸出結果本質上具有主觀性，取決於實踐者或體系本身的解釋方式。目前並無科學共識證明八字或任何相關體系能夠預測未來事件、性格特質或人生結果。',
            'AI 生成的內容可能存在錯誤、不一致或遺漏。本服務所依賴的模型本質上是機率性的，對相同輸入在不同工作階段中可能產生不同結果。',
            '我們不對本服務生成的任何內容的準確性、完整性、可靠性或適用性作出任何明示或暗示的陳述或保證。',
          ],
        },
        {
          heading: '4. 使用者責任',
          body: [
            '您承認並同意，您所做出的一切決定——無論是個人、醫療、法律、財務、感情還是其他方面——均由您自主決定，並由您獨自承擔後果。',
            'Bazi Master 及其營運者、員工與關聯方不對因您依賴本服務生成的內容而產生的任何結果、後果、損失或損害承擔責任，無論是直接的還是間接的。這包括但不限於：財務損失、不良健康後果、感情困難、法律後果，或因根據 Bazi Master 內容採取或未採取行動而造成的任何其他損害。',
          ],
        },
        {
          heading: '5. 心理健康提示',
          body: [
            '如果您目前正經歷情緒困擾、心理健康危機、自傷念頭或任何相關困難，請勿依賴本服務尋求支持。',
            '請聯繫您所在地區的專業心理健康人員或危機支援資源。這些服務由經過訓練的專業人員提供，能夠給予您所需的關懷與支持。',
          ],
        },
        {
          heading: '6. 文化與教育背景',
          body: [
            '八字（四柱推命）是中國傳統文化與哲學思想的重要組成部分。Bazi Master 透過 AI 解讀的方式呈現這一傳統，作為文化教育與個人探索的途徑。',
            '該體系尚未經過同儕審查的科學研究驗證。我們將其作為一個具有重要文化價值的解釋框架呈現，而非預測或診斷工具。我們鼓勵用戶以批判性眼光看待此類內容，並了解其傳統文化屬性。',
          ],
        },
        {
          heading: '7. 不得用於重大人生決策',
          body: [
            '您同意不將 Bazi Master 作為任何重大人生決策的唯一或主要依據，包括但不限於：',
            '醫療決策——包括治療方案選擇、用藥決定，或尋求或停止醫療照護的決定。',
            '法律決策——包括與合約、糾紛、訴訟或法規遵循相關的決定。',
            '財務決策——包括投資選擇、重大購買、資產配置或退休規劃。',
            '感情決策——包括婚姻、分離、監護安排，或涉及重要個人關係的決定。',
            '職業或教育決策——包括重大職業轉變、入學報名或專業資格選擇。',
            '任何其他因錯誤或不當指導可能對自身或他人造成實質性傷害的決策。',
          ],
        },
        {
          heading: '8. 聯繫我們',
          body: [
            '如對本免責聲明有任何疑問，請透過以下方式聯繫我們：contact@bazi-master.com',
          ],
        },
      ],
    },
  },
}
