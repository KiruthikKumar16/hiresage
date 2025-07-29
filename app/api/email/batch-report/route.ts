import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { emailService, reportService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

const batchEmailReportSchema = z.object({
  reportId: z.string(),
  recipients: z.array(z.string().email()),
  subject: z.string().optional(),
  message: z.string().optional(),
  includeAttachment: z.boolean().default(true)
})

export const POST = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      const body = await request.json()
      const validatedData = batchEmailReportSchema.parse(body)

      // Get the report
      const report = await reportService.getReportById(validatedData.reportId)
      if (!report) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Report not found' 
          },
          { status: 404 }
        )
      }

      // Verify user has access to this report
      if (report.interview_id) {
        const interview = await reportService.getInterviewForReport(report.interview_id)
        if (!interview || interview.user_id !== user.id) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Access denied to this report' 
            },
            { status: 403 }
          )
        }
      }

      // Generate email content
      const emailContent = await emailService.generateReportEmail(
        report,
        validatedData.subject,
        validatedData.message
      )

      // Send emails to all recipients
      const emailResults = await Promise.allSettled(
        validatedData.recipients.map(recipient =>
          emailService.sendReportEmail({
            to: recipient,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            reportId: validatedData.reportId,
            includeAttachment: validatedData.includeAttachment
          })
        )
      )

      // Log email sending
      const successfulEmails = emailResults.filter(result => result.status === 'fulfilled')
      const failedEmails = emailResults.filter(result => result.status === 'rejected')

      await emailService.logEmailBatch({
        report_id: validatedData.reportId,
        recipients: validatedData.recipients,
        successful_count: successfulEmails.length,
        failed_count: failedEmails.length,
        sent_by: user.id,
        sent_at: new Date().toISOString()
      })

      // Update report with email status
      await reportService.updateReport(validatedData.reportId, {
        email_sent: true,
        email_recipients: validatedData.recipients,
        email_sent_at: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        data: {
          totalRecipients: validatedData.recipients.length,
          successfulEmails: successfulEmails.length,
          failedEmails: failedEmails.length,
          failedRecipients: failedEmails.map((result, index) => 
            result.status === 'rejected' ? validatedData.recipients[index] : null
          ).filter(Boolean)
        }
      })

    } catch (error) {
      console.error('Batch email report error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send batch email report' 
        },
        { status: 500 }
      )
    }
  }
)