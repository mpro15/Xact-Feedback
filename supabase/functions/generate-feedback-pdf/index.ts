import { serve } from 'https://deno.land/x/supabase_functions@0.5.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackData {
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  position: string;
  rejection_stage: string;
  rejection_reason: string;
  company_id: string;
  company_name: string;
  company_logo?: string;
  primary_color: string;
  secondary_color: string;
}

export default serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false },
      }
    );

    const { data: feedbackData }: { data: FeedbackData } = await req.json();

    // Generate AI-powered feedback content
    const feedbackContent = generateFeedbackContent(feedbackData);

    // Generate PDF HTML
    const pdfHtml = generatePDFHTML(feedbackData, feedbackContent);

    // Convert HTML to PDF using Puppeteer-like functionality
    const pdfBuffer = await generatePDF(pdfHtml);

    // Upload PDF to Supabase Storage
    const fileName = `feedback-${feedbackData.candidate_id}-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('feedback-pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (uploadError) {
      throw new Error(`PDF upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('feedback-pdfs')
      .getPublicUrl(fileName);

    // Store feedback report in database
    const { data: reportData, error: reportError } = await supabaseClient
      .from('feedback_reports')
      .insert({
        company_id: feedbackData.company_id,
        candidate_id: feedbackData.candidate_id,
        content: feedbackContent,
        pdf_url: publicUrl,
        generated_by: null, // Will be set by RLS
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (reportError) {
      throw new Error(`Database insert failed: ${reportError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: publicUrl,
        feedback_report_id: reportData.id,
        content: feedbackContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function generateFeedbackContent(data: FeedbackData) {
  // AI-powered feedback generation based on rejection stage and reason
  const skillGaps = getSkillGaps(data.position, data.rejection_stage);
  const resumeTips = getResumeTips(data.position, data.rejection_stage);
  const courses = getRecommendedCourses(data.position, skillGaps);

  return {
    summary: `Thank you for your interest in the ${data.position} position at ${data.company_name}. While we were impressed with your background, we've decided to move forward with another candidate at the ${data.rejection_stage} stage.`,
    
    rejection_reason: data.rejection_reason,
    
    skill_gaps: skillGaps,
    
    motivational_message: `We believe in your potential and want to help you grow. The feedback below is designed to help you strengthen your skills and increase your chances in future applications. Many successful candidates have used similar feedback to land their dream jobs.`,
    
    resume_tips: resumeTips,
    
    courses: courses,
    
    next_steps: [
      'Review and implement the resume improvement suggestions',
      'Complete at least 2-3 recommended courses',
      'Build a portfolio project showcasing your new skills',
      'Consider reapplying in 6-12 months'
    ]
  };
}

function getSkillGaps(position: string, rejectionStage: string): string[] {
  const skillMap: Record<string, Record<string, string[]>> = {
    'Frontend Developer': {
      'Technical Interview': ['Advanced React patterns', 'State management (Redux/Zustand)', 'TypeScript proficiency', 'Testing frameworks'],
      'System Design': ['Component architecture', 'Performance optimization', 'Bundle optimization', 'Micro-frontends'],
      'Final Interview': ['Leadership skills', 'Mentoring abilities', 'Project management', 'Communication skills']
    },
    'Backend Developer': {
      'Technical Interview': ['Database optimization', 'API design patterns', 'Microservices architecture', 'Caching strategies'],
      'System Design': ['Scalability patterns', 'Load balancing', 'Database sharding', 'Message queues'],
      'Final Interview': ['Team collaboration', 'Code review skills', 'Technical documentation', 'Agile methodologies']
    },
    'Product Manager': {
      'Case Study': ['Market analysis', 'User research methods', 'Prioritization frameworks', 'Metrics definition'],
      'Final Interview': ['Stakeholder management', 'Cross-functional leadership', 'Strategic thinking', 'Data-driven decisions']
    }
  };

  return skillMap[position]?.[rejectionStage] || ['Communication skills', 'Technical knowledge', 'Problem-solving', 'Industry experience'];
}

function getResumeTips(position: string, rejectionStage: string): string[] {
  return [
    'Quantify your achievements with specific metrics and numbers',
    'Highlight relevant technologies and frameworks for the role',
    'Include links to your portfolio, GitHub, or live projects',
    'Tailor your experience section to match job requirements',
    'Add a skills section with proficiency levels',
    'Include relevant certifications and continuous learning'
  ];
}

function getRecommendedCourses(position: string, skillGaps: string[]) {
  const courseDatabase = {
    'Advanced React patterns': {
      free: [
        { title: 'React Advanced Patterns', provider: 'freeCodeCamp', url: 'https://freecodecamp.org/react-advanced', rating: 4.8 },
        { title: 'React Hooks Deep Dive', provider: 'YouTube', url: 'https://youtube.com/react-hooks', rating: 4.6 },
        { title: 'React Performance', provider: 'React Docs', url: 'https://react.dev/performance', rating: 4.9 }
      ],
      paid: [
        { title: 'Advanced React', provider: 'Frontend Masters', url: 'https://frontendmasters.com/courses/advanced-react/', rating: 4.9, price: '$39/month' },
        { title: 'React - The Complete Guide', provider: 'Udemy', url: 'https://udemy.com/react-complete', rating: 4.7, price: '$84.99' },
        { title: 'React Nanodegree', provider: 'Udacity', url: 'https://udacity.com/react', rating: 4.5, price: '$399/month' }
      ]
    },
    'Database optimization': {
      free: [
        { title: 'SQL Performance Tuning', provider: 'Khan Academy', url: 'https://khanacademy.org/sql', rating: 4.5 },
        { title: 'Database Indexing', provider: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/database', rating: 4.8 },
        { title: 'PostgreSQL Tutorial', provider: 'PostgreSQL.org', url: 'https://postgresql.org/tutorial', rating: 4.7 }
      ],
      paid: [
        { title: 'Database Systems', provider: 'Coursera', url: 'https://coursera.org/database-systems', rating: 4.6, price: '$49/month' },
        { title: 'SQL Mastery', provider: 'Pluralsight', url: 'https://pluralsight.com/sql', rating: 4.8, price: '$29/month' },
        { title: 'Advanced Database Design', provider: 'UpGrad', url: 'https://upgrad.com/database', rating: 4.4, price: '$199' }
      ]
    }
  };

  // Select courses based on skill gaps
  const selectedCourses = {
    free: [] as any[],
    paid: [] as any[]
  };

  skillGaps.slice(0, 2).forEach(skill => {
    const courses = courseDatabase[skill as keyof typeof courseDatabase];
    if (courses) {
      selectedCourses.free.push(...courses.free.slice(0, 2));
      selectedCourses.paid.push(...courses.paid.slice(0, 2));
    }
  });

  // Ensure we have exactly 3 free and 3 paid courses
  while (selectedCourses.free.length < 3) {
    selectedCourses.free.push({
      title: 'Programming Fundamentals',
      provider: 'freeCodeCamp',
      url: 'https://freecodecamp.org/fundamentals',
      rating: 4.7
    });
  }

  while (selectedCourses.paid.length < 3) {
    selectedCourses.paid.push({
      title: 'Professional Development',
      provider: 'Coursera',
      url: 'https://coursera.org/professional',
      rating: 4.5,
      price: '$49/month'
    });
  }

  return {
    free: selectedCourses.free.slice(0, 3),
    paid: selectedCourses.paid.slice(0, 3)
  };
}

function generatePDFHTML(data: FeedbackData, content: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .page { 
            width: 210mm; 
            min-height: 297mm; 
            padding: 20mm; 
            margin: 0 auto; 
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
            display: flex; 
            align-items: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 3px solid ${data.primary_color};
        }
        .logo { 
            width: 60px; 
            height: 60px; 
            margin-right: 20px;
            border-radius: 10px;
        }
        .company-info h1 { 
            color: ${data.primary_color}; 
            font-size: 28px; 
            margin-bottom: 5px;
        }
        .company-info p { 
            color: #666; 
            font-size: 16px;
        }
        .section { 
            margin-bottom: 25px; 
        }
        .section h2 { 
            color: ${data.primary_color}; 
            font-size: 20px; 
            margin-bottom: 15px;
            padding-left: 10px;
            border-left: 4px solid ${data.secondary_color};
        }
        .section h3 { 
            color: ${data.secondary_color}; 
            font-size: 16px; 
            margin-bottom: 10px;
        }
        .skill-gap { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 15px; 
            margin: 5px; 
            border-radius: 20px; 
            display: inline-block;
            font-size: 14px;
        }
        .course-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-top: 15px;
        }
        .course-section h3 {
            background: ${data.primary_color};
            color: white;
            padding: 10px;
            border-radius: 8px 8px 0 0;
            margin: 0;
        }
        .course-item { 
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px; 
            padding: 15px; 
            margin-bottom: 10px;
            transition: transform 0.2s;
        }
        .course-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .course-title { 
            font-weight: bold; 
            color: ${data.primary_color}; 
            margin-bottom: 5px;
        }
        .course-provider { 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 5px;
        }
        .course-rating { 
            color: #ffc107; 
            font-size: 14px;
        }
        .course-price { 
            color: ${data.secondary_color}; 
            font-weight: bold; 
            font-size: 14px;
        }
        .cta-buttons { 
            display: flex; 
            justify-content: space-around; 
            margin: 30px 0;
            flex-wrap: wrap;
        }
        .cta-button { 
            background: linear-gradient(135deg, ${data.primary_color} 0%, ${data.secondary_color} 100%);
            color: white; 
            padding: 12px 24px; 
            border-radius: 25px; 
            text-decoration: none; 
            font-weight: bold;
            margin: 5px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px;
            border-top: 2px solid ${data.primary_color};
            color: #666;
        }
        .motivational { 
            background: linear-gradient(135deg, ${data.primary_color}20 0%, ${data.secondary_color}20 100%);
            padding: 20px; 
            border-radius: 10px; 
            border-left: 5px solid ${data.primary_color};
            font-style: italic;
        }
        .resume-tips { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .resume-tips ul { 
            padding-left: 20px; 
        }
        .resume-tips li { 
            margin-bottom: 8px; 
            color: #555;
        }
        .page-break { 
            page-break-before: always; 
        }
    </style>
</head>
<body>
    <!-- Page 1 -->
    <div class="page">
        <div class="header">
            ${data.company_logo ? `<img src="${data.company_logo}" alt="Company Logo" class="logo">` : ''}
            <div class="company-info">
                <h1>${data.company_name}</h1>
                <p>Candidate Feedback Report</p>
            </div>
        </div>

        <div class="section">
            <h2>Dear ${data.candidate_name},</h2>
            <p>${content.summary}</p>
        </div>

        <div class="section motivational">
            <p><strong>Our Message to You:</strong></p>
            <p>${content.motivational_message}</p>
        </div>

        <div class="section">
            <h2>Areas for Growth</h2>
            <p>Based on your application for <strong>${data.position}</strong>, here are key areas that could strengthen your profile:</p>
            <div style="margin-top: 15px;">
                ${content.skill_gaps.map((skill: string) => `<span class="skill-gap">${skill}</span>`).join('')}
            </div>
        </div>

        <div class="section">
            <h2>Resume Enhancement Tips</h2>
            <div class="resume-tips">
                <ul>
                    ${content.resume_tips.map((tip: string) => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="cta-buttons">
            <a href="https://resume-builder.com" class="cta-button">🔧 Fix Resume</a>
            <a href="https://learning-platform.com" class="cta-button">📚 Start Learning</a>
            <a href="https://${data.company_name.toLowerCase().replace(/\s+/g, '')}.com/careers" class="cta-button">🔄 Re-Apply Later</a>
        </div>
    </div>

    <!-- Page 2 -->
    <div class="page page-break">
        <div class="section">
            <h2>Recommended Learning Path</h2>
            <p>We've curated these courses specifically for your career growth:</p>
            
            <div class="course-grid">
                <div class="course-section">
                    <h3>🆓 Free Courses</h3>
                    ${content.courses.free.map((course: any) => `
                        <div class="course-item">
                            <div class="course-title">${course.title}</div>
                            <div class="course-provider">${course.provider}</div>
                            <div class="course-rating">⭐ ${course.rating}/5</div>
                            <a href="${course.url}" style="color: ${data.primary_color}; text-decoration: none;">→ Start Course</a>
                        </div>
                    `).join('')}
                </div>

                <div class="course-section">
                    <h3>💎 Premium Courses</h3>
                    ${content.courses.paid.map((course: any) => `
                        <div class="course-item">
                            <div class="course-title">${course.title}</div>
                            <div class="course-provider">${course.provider}</div>
                            <div class="course-rating">⭐ ${course.rating}/5</div>
                            <div class="course-price">${course.price}</div>
                            <a href="${course.url}" style="color: ${data.primary_color}; text-decoration: none;">→ Enroll Now</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Your Next Steps</h2>
            <div class="resume-tips">
                <ol>
                    ${content.next_steps.map((step: string) => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        </div>

        <div class="section motivational">
            <p><strong>Remember:</strong> Every rejection is a stepping stone to success. Many of our current employees received similar feedback and used it to grow into exceptional professionals. We believe in your potential and look forward to seeing your progress!</p>
        </div>

        <div class="footer">
            <p>Generated by Xact Feedback • ${data.company_name}</p>
            <p>This report was created specifically for ${data.candidate_name}</p>
            <p style="margin-top: 10px; color: ${data.primary_color};">Keep growing, keep learning! 🚀</p>
        </div>
    </div>
</body>
</html>
  `;
}

async function generatePDF(html: string): Promise<Uint8Array> {
  // In a real implementation, you would use Puppeteer or similar
  // For this example, we'll simulate PDF generation
  
  // This would typically be:
  // const browser = await puppeteer.launch()
  // const page = await browser.newPage()
  // await page.setContent(html)
  // const pdf = await page.pdf({ format: 'A4', printBackground: true })
  // await browser.close()
  // return pdf
  
  // For now, we'll create a mock PDF buffer
  const encoder = new TextEncoder();
  return encoder.encode(`%PDF-1.4 Mock PDF Content for: ${html.substring(0, 100)}...`);
}