import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Parse the event
    const event = JSON.parse(body)
    console.log('Received Stripe webhook:', event.type)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabase, event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// Generate signup token for new users
async function generateSignupToken(supabase: any, email: string) {
  try {
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    const { error } = await supabase
      .from('signup_tokens')
      .insert({
        token: token,
        email: email,
        expires_at: expiresAt,
        used: false
      })
    
    if (error) {
      console.error('Error creating signup token:', error)
      throw error
    }
    
    console.log('Signup token generated for:', email)
    return token
    
  } catch (error) {
    console.error('Failed to generate signup token:', error)
    throw error
  }
}

// Send welcome email via SMTP
async function sendWelcomeEmailWithSMTP(supabase: any, email: string, fullName: string, userId: string) {
  try {
    console.log('📧 Sending welcome email via SMTP to:', email)
    
    // Generate signup token
    const signupToken = await generateSignupToken(supabase, email)
    
    // Create signup URL
    const signupUrl = `https://app.vmetrics.com.br/auth/signup?token=${signupToken}`
    
    // Send email via Supabase SMTP
    const { data, error } = await supabase.auth.admin.sendRawEmail({
      to: email,
      subject: 'Bem-vindo ao VMetrics! Complete seu cadastro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao VMetrics</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3cd48f; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background-color: #3cd48f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bem-vindo ao VMetrics!</h1>
            </div>
            <div class="content">
              <h2>Olá, ${fullName}!</h2>
              <p>Sua compra foi realizada com sucesso e estamos muito felizes em tê-lo conosco!</p>
              <p>Para começar a usar o VMetrics, você precisa completar seu cadastro na plataforma.</p>
              
              <div style="text-align: center;">
                <a href="${signupUrl}" class="button">🚀 Completar Cadastro</a>
              </div>
              
              <p><strong>Importante:</strong></p>
              <ul>
                <li>Este link é válido por 24 horas</li>
                <li>Após o cadastro, você poderá configurar sua API key do RedTrack</li>
                <li>Em seguida, será redirecionado para o dashboard</li>
              </ul>
              
              <p>Se tiver alguma dúvida, entre em contato conosco.</p>
              
              <p>Atenciosamente,<br>Equipe VMetrics</p>
            </div>
            <div class="footer">
              <p>Este email foi enviado automaticamente. Não responda a esta mensagem.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        🎉 Bem-vindo ao VMetrics!
        
        Olá, ${fullName}!
        
        Sua compra foi realizada com sucesso e estamos muito felizes em tê-lo conosco!
        
        Para começar a usar o VMetrics, você precisa completar seu cadastro na plataforma.
        
        Link para cadastro: ${signupUrl}
        
        IMPORTANTE:
        - Este link é válido por 24 horas
        - Após o cadastro, você poderá configurar sua API key do RedTrack
        - Em seguida, será redirecionado para o dashboard
        
        Se tiver alguma dúvida, entre em contato conosco.
        
        Atenciosamente,
        Equipe VMetrics
        
        ---
        Este email foi enviado automaticamente. Não responda a esta mensagem.
      `
    })
    
    if (error) {
      console.error('❌ Error sending email via SMTP:', error)
      throw error
    }
    
    console.log('✅ Welcome email sent successfully via SMTP to:', email)
    
    // Log email in messages table
    await supabase
      .from('messages')
      .insert({
        sender: 'suporte@vmetrics.com.br',
        recipient: email,
        subject: 'Bem-vindo ao VMetrics! Complete seu cadastro',
        html_body: 'Welcome email template',
        text_body: 'Welcome email template',
        status: 'sent',
        sent_at: new Date(),
        provider_response: JSON.stringify({ method: 'smtp', success: true })
      })
    
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Failed to send welcome email via SMTP:', error)
    
    // Log error in messages table
    await supabase
      .from('messages')
      .insert({
        sender: 'suporte@vmetrics.com.br',
        recipient: email,
        subject: 'Bem-vindo ao VMetrics! Complete seu cadastro',
        html_body: 'Welcome email template',
        text_body: 'Welcome email template',
        status: 'failed',
        sent_at: new Date(),
        provider_response: JSON.stringify({ method: 'smtp', error: error.message })
      })
    
    throw error
  }
}

// Handle checkout session completed
async function handleCheckoutCompleted(supabase: any, session: any) {
  console.log('Processing checkout completed:', session.id)
  
  try {
    // Check if this is a subscription checkout
    if (session.mode === 'subscription' && session.subscription) {
      
      // Get customer details from session
      const customerEmail = session.customer_details?.email
      const customerName = session.customer_details?.name
      const customerId = session.customer
      const subscriptionId = session.subscription
      
      console.log('Customer details:', { customerEmail, customerName, customerId, subscriptionId })
      
      // Check if user already exists by email first, then by stripe_customer_id
      let userId = null
      
      // Try to find user by email first
      const { data: existingUserByEmail, error: emailError } = await supabase
        .from('users')
        .select('id, stripe_customer_id')
        .eq('email', customerEmail)
        .single()
      
      if (existingUserByEmail) {
        userId = existingUserByEmail.id
        console.log('Existing user found by email:', userId)
        
        // Update stripe_customer_id if different
        if (existingUserByEmail.stripe_customer_id !== customerId) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId)
          
          if (updateError) {
            console.error('Error updating stripe_customer_id:', updateError)
          } else {
            console.log('Updated stripe_customer_id for existing user')
          }
        }
      } else {
        // Try to find by stripe_customer_id
        const { data: existingUserByStripe, error: stripeError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        
        if (existingUserByStripe) {
          userId = existingUserByStripe.id
          console.log('Existing user found by stripe_customer_id:', userId)
        } else {
          // Create new user only if neither exists
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              email: customerEmail,
              full_name: customerName || 'Usuário VMetrics',
              stripe_customer_id: customerId,
              is_active: true
            })
            .select('id')
            .single()
          
          if (createError) {
            console.error('Error creating user:', createError)
            return
          }
          
          userId = newUser.id
          console.log('New user created:', userId)
        }
      }
      
      // Use UPSERT to handle both new plans and upgrades
      const { error: planError } = await supabase
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan_type: 'monthly', // Will be updated by subscription events
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }, {
          onConflict: 'stripe_subscription_id'
        })
        
      if (planError) {
        console.error('Error updating user plan:', planError)
        return
      }
      
      console.log('User plan created/updated successfully')
      
      // Send welcome email via SMTP
      if (customerEmail && customerName && userId) {
        await sendWelcomeEmailWithSMTP(supabase, customerEmail, customerName, userId)
      }
    }
    
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error)
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(supabase: any, subscription: any) {
  console.log('Processing subscription created:', subscription.id)
  
  try {
    // Determine plan type based on price amount
    let planType = 'monthly'
    const priceAmount = subscription.items?.data?.[0]?.price?.unit_amount || 0
    
    console.log('Price amount from subscription:', priceAmount)
    
    // Map price amounts to plan types
    if (priceAmount === 7900) { // R$ 79,00 - Plano Mensal
      planType = 'monthly'
    } else if (priceAmount === 19700) { // R$ 197,00 - Plano Trimestral
      planType = 'quarterly'
    } else {
      planType = 'monthly' // Fallback para monthly
    }
    
    console.log('Detected plan type:', planType)
    
    // Find or create user by email (most reliable for subscriptions)
    let userId: string | null = null
    let customerEmail: string | null = null
    let customerName: string | null = null
    
    // First, try to get customer email from Stripe subscription
    customerEmail = subscription.customer_email
    
    if (!customerEmail) {
      console.log('No customer_email in subscription, trying to find user by stripe_customer_id...')
      
      // Try to find user by stripe_customer_id first
      const { data: existingUserByStripe, error: stripeError } = await supabase
        .from('users')
        .select('id, email, full_name, stripe_customer_id')
        .eq('stripe_customer_id', subscription.customer)
        .single()
      
      if (existingUserByStripe) {
        userId = existingUserByStripe.id
        customerEmail = existingUserByStripe.email
        customerName = existingUserByStripe.full_name
        console.log('Existing user found by stripe_customer_id:', userId, 'with email:', customerEmail)
        
        // Update stripe_customer_id if different
        if (existingUserByStripe.stripe_customer_id !== subscription.customer) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ stripe_customer_id: subscription.customer })
            .eq('id', userId)
          
          if (updateError) {
            console.error('Error updating stripe_customer_id:', updateError)
          } else {
            console.log('Updated stripe_customer_id for existing user')
          }
        }
      }
    }
    
    // If we have an email, try to find user by email
    if (customerEmail && !userId) {
      console.log('Searching for user by email:', customerEmail)
      
      const { data: existingUserByEmail, error: emailError } = await supabase
        .from('users')
        .select('id, email, full_name, stripe_customer_id')
        .eq('email', customerEmail)
        .single()
      
      if (existingUserByEmail) {
        userId = existingUserByEmail.id
        customerName = existingUserByEmail.full_name
        console.log('Existing user found by email:', userId, 'with stripe_customer_id:', existingUserByEmail.stripe_customer_id)
        
        // Update stripe_customer_id if different
        if (existingUserByEmail.stripe_customer_id !== subscription.customer) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ stripe_customer_id: subscription.customer })
            .eq('id', userId)
          
          if (updateError) {
            console.error('Error updating stripe_customer_id:', updateError)
          } else {
            console.log('Updated stripe_customer_id for existing user')
          }
        }
      }
    }
    
    // If still no user found, create a new one
    if (!userId) {
      console.log('No existing user found, creating new user...')
      
      // Try to get a meaningful email
      const finalEmail = customerEmail || `stripe_${subscription.customer}@vmetrics.com.br`
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: finalEmail,
          full_name: 'Usuário VMetrics',
          stripe_customer_id: subscription.customer,
          is_active: true
        })
        .select('id')
        .single()
      
      if (createError) {
        console.error('Error creating user:', createError)
        return
      }
      
      userId = newUser.id
      customerEmail = finalEmail
      customerName = 'Usuário VMetrics'
      console.log('New user created with email:', finalEmail, 'ID:', userId)
    }
    
    // First, check if user already has an active plan
    console.log('Checking existing plans for user:', userId)
    
    const { data: existingPlans, error: plansError } = await supabase
      .from('user_plans')
      .select('id, plan_type, status')
      .eq('user_id', userId)
      .eq('status', 'active')
    
    if (plansError) {
      console.error('Error checking existing plans:', plansError)
      return
    }
    
    console.log('Existing active plans found:', existingPlans?.length || 0)
    
    // If user has active plans, deactivate them first
    if (existingPlans && existingPlans.length > 0) {
      console.log('Deactivating existing plans...')
      
      const { error: deactivateError } = await supabase
        .from('user_plans')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active')
      
      if (deactivateError) {
        console.error('Error deactivating existing plans:', deactivateError)
        return
      }
      
      console.log('Existing plans deactivated successfully')
    }
    
    // Now create the new plan
    console.log('Creating new plan for user:', userId, 'with subscription:', subscription.id)
    
    const { error: insertError } = await supabase
      .from('user_plans')
      .insert({
        user_id: userId,
        plan_type: planType,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000)
      })
    
    if (insertError) {
      console.error('Error creating user plan:', insertError)
      return
    }
    
    console.log('User plan created successfully with plan type:', planType)
    
    // Send welcome email via SMTP if we have email and name
    if (customerEmail && customerName && userId) {
      await sendWelcomeEmailWithSMTP(supabase, customerEmail, customerName, userId)
    }
    
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  console.log('Processing subscription updated:', subscription.id)
  
  try {
    // Determine plan type based on price amount
    let planType = 'monthly'
    const priceAmount = subscription.items?.data?.[0]?.price?.unit_amount || 0
    
    console.log('Price amount from subscription update:', priceAmount)
    
    // Map price amounts to plan types
    if (priceAmount === 7900) { // R$ 79,00 - Plano Mensal
      planType = 'monthly'
    } else if (priceAmount === 19700) { // R$ 197,00 - Plano Trimestral
      planType = 'quarterly'
    } else {
      planType = 'monthly' // Fallback para monthly
    }
    
    console.log('Detected plan type:', planType)
    
    // Use UPSERT to handle subscription updates
    const { error } = await supabase
      .from('user_plans')
      .upsert({
        plan_type: planType,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000)
      }, {
        onConflict: 'stripe_subscription_id'
      })
      
    if (error) {
      console.error('Error updating subscription:', error)
      return
    }
    
    console.log('Subscription updated successfully with plan type:', planType)
    
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  console.log('Processing subscription deleted:', subscription.id)
  
  try {
    // Update user plan status to cancelled
    const { error } = await supabase
      .from('user_plans')
      .update({
        status: 'cancelled',
        updated_at: new Date()
      })
      .eq('stripe_subscription_id', subscription.id)
      
    if (error) {
      console.error('Error updating subscription status:', error)
      return
    }
    
    console.log('Subscription marked as cancelled')
    
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(supabase: any, invoice: any) {
  console.log('Processing invoice payment succeeded:', invoice.id)
  
  try {
    // Check if invoice already exists
    const { data: existingInvoice, error: checkError } = await supabase
      .from('invoices')
      .select('id')
      .eq('stripe_invoice_id', invoice.id)
      .single()
    
    if (existingInvoice) {
      console.log('Invoice already exists, skipping duplicate:', invoice.id)
      return
    }
    
    // Find user by stripe_customer_id to get user_id
    let userId = null
    if (invoice.customer) {
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .single()
      
      if (existingUser) {
        userId = existingUser.id
        console.log('Found user for invoice:', userId)
      } else {
        console.log('User not found for customer:', invoice.customer)
      }
    }
    
    // Log the successful payment
    const { error } = await supabase
      .from('invoices')
      .insert({
        user_id: userId, // ✅ AGORA TEM user_id!
        stripe_invoice_id: invoice.id,
        stripe_customer_id: invoice.customer,
        stripe_subscription_id: invoice.subscription,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'paid',
        period_start: new Date(invoice.period_start * 1000),
        period_end: new Date(invoice.period_end * 1000)
      })
      
    if (error) {
      console.error('Error logging invoice:', error)
      return
    }
    
    console.log('Invoice logged successfully with user_id:', userId)
    
  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error)
  }
}
