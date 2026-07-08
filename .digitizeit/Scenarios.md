# Scenarios

**Type:** Scenarios
**Created:** 2026-07-08 07:57:21 UTC
**Updated:** 2026-07-08 07:57:21 UTC

---

```gherkin
Feature: Onboarding Wizard
  As a product user
  I want a 4-step onboarding wizard to create AI employees
  So that I can quickly build an AI team tailored to my business

  Background:
    Given I am an authenticated user on the "Let's build your AI team" onboarding wizard start page
    And the UI shows a 4-dot progress bar indicating step 1 of 4

  Scenario: Happy Path - Complete 4-step onboarding to create agents
    Given I see the heading "Let's build your AI team" and an empty work description textarea
    When I type "Acme Plumbing Services: residential plumbing, invoicing, and monthly reporting" into the textarea
    And I click Next
    Then the progress bar updates to step 2 of 4
    When I select the capability pills "Invoicing" and "Expense tracking"
    And I click Next
    Then the progress bar updates to step 3 of 4
    When I select the agent cards "Accountant Agent" and "Operations Agent"
    And I click the dashed "Add your own role" card and enter Name "Contractor Liaison" and Description "Coordinates subcontractor invoices"
    And I click Create your Agents
    Then the progress bar updates to step 4 of 4
    And I see heading "Your AI team is ready"
    And I see the first recommended agent "Accountant Agent" with a Configure button
    When I click Go to Dashboard
    Then I am navigated to the AI Team dashboard and the newly created agents appear in the agent grid

  Scenario: AI-assist generates a draft business description and is editable
    Given I am on Step 1 with an empty textarea
    When I click the "Help me write this" AI-assist button
    Then a draft appears: "Acme Plumbing Services specializes in residential plumbing, billing, and monthly financial reporting."
    When I edit the draft to add "24/7 emergency response"
    And I click Next
    Then step 2 receives context based on "24/7 emergency response" and suggests relevant capabilities

  Scenario: Validation - Prevent advancing with empty work description
    Given I am on Step 1 with an empty textarea
    When I click Next
    Then I see an inline validation error "Please describe your business to continue"
    And the progress bar stays on step 1 of 4

  Scenario: Step 2 - "Suggest for me" auto-selects capabilities based on description
    Given I completed Step 1 with description "Small e-commerce store selling handmade candles. Needs invoicing, customer follow-up, and reporting."
    When I arrive at Step 2
    And I click the "Suggest for me" link in the AI suggestion banner
    Then the pills "Invoicing", "Client follow-up", and "Reporting" become selected
    And a banner shows "Suggested based on your business description"

  Scenario: Step 3 - Create agents with mix of prebuilt and custom roles and handle duplicate role names
    Given I am on Step 3 with prebuilt cards visible including "AI Sales Assistant"
    When I select "AI Sales Assistant"
    And I click the dashed "Add your own role" and enter Name "AI Sales Assistant" and Description "Duplicate name test"
    And I click Create your Agents
    Then I see an error "Role name already exists. Choose a unique name."
    When I change the custom role name to "Regional Sales Assistant" and click Create your Agents
    Then the new custom agent "Regional Sales Assistant" is created and listed

  Scenario: Confirmation - Next-action suggestions are actionable
    Given I am on Step 4 with heading "Your AI team is ready"
    Then I see four next-action suggestion cards: "Create first task", "Connect tools", "Create another agent", "Add business knowledge"
    When I click "Connect tools"
    Then I am navigated to the Agent Tools tab for the recommended agent

Feature: AI Team Dashboard
  As a product user
  I want a central dashboard to view and manage my AI employees
  So that I can monitor status, add new agents, and act on recommendations

  Background:
    Given I am an authenticated user on the "AI Team" dashboard
    And my team contains:
      | name             | status      | tasks | tools | last_active       |
      | Accountant Agent | Active      | 3     | 2     | 2026-06-30 10:05Z |
      | Ops Agent        | Needs Setup | 0     | 0     | 2026-06-28 09:00Z |
      | Sales Agent      | Paused      | 1     | 1     | 2026-06-25 18:20Z |

  Scenario: Happy Path - View agents and add recommended agent from right panel
    Given I see the page title "AI Team" and a subtitle "Manage your AI employees"
    And I see an "Add AI Employee" button
    And the agent cards grid lists the three agents from Background with name, status badge, task count, tool count, last active time, and Configure and Assign Task buttons
    And the right panel shows AI-recommended agents including "Payroll Agent" with reasoning "Recommended to handle payroll schedules"
    When I click "Add to team" on the "Payroll Agent" recommendation
    Then a confirmation appears "Payroll Agent added to your team"
    And the team overview widget updates counts by status and the agent grid now includes "Payroll Agent"

  Scenario: Empty state - No agents shows call to action
    Given I remove all agents from the team
    When I view the AI Team dashboard
    Then I see an empty state message "You don't have any AI Employees yet"
    And I see a CTA "Add AI Employee" that opens the agent creation flow

  Scenario: Agent card actions - Configure opens agent overview; Assign Task increments task count
    Given "Accountant Agent" shows tasks 3 and status Active
    When I click Configure on the "Accountant Agent" card
    Then I am navigated to the Accountant Agent Overview tab
    When I return and click Assign Task on the "Accountant Agent" card and create task "Reconcile June invoices"
    Then the "Accountant Agent" task count updates to 4
    And the agent's last active time updates to the current timestamp

  Scenario: Status change - Pause agent from dashboard updates status and overview widget
    Given "Sales Agent" status is Paused
    When I click Configure on "Sales Agent" and click Resume
    Then "Sales Agent" status badge changes to Active
    And the Team overview widget reflects the status change

Feature: Agent Overview Tab
  As an account admin
  I want a detailed overview page for each agent
  So that I can manage mission, responsibilities, restrictions, metrics, and feedback

  Background:
    Given I am on the Agent Overview tab for "Accountant Agent"
    And the header shows name "Accountant Agent", status "Active", task count 4, workload 30%

  Scenario: Happy Path - Edit mission, add responsibilities and restrictions, and submit feedback
    Given I see the Mission section with an editable long-form textarea containing "Manage accounting tasks"
    When I append " and prepare monthly financial statements" and save
    Then the Mission displays the updated text
    When I type "Prepare monthly invoices" into Add a responsibility input and click Add
    Then the responsibility appears in the bulleted list
    When I type "Never share client bank details" into the Restrictions input and click the red Add button
    Then the restriction appears in the red-tinted list
    When I click feedback pill "Good output"
    Then a feedback entry is recorded "Good output" with current timestamp visible in Activity Log

  Scenario: Validation - Prevent adding empty responsibility or restriction
    Given the Add a responsibility input is empty
    When I click Add
    Then I see inline validation "Responsibility cannot be empty"
    Given the Restrictions input is empty
    When I click the red Add button
    Then I see inline validation "Restriction cannot be empty"

  Scenario: Performance metrics display correct values and update after actions
    Given performance metrics currently show Tasks completed 12 and Avg. response time 2m
    When the agent completes a task "Approve invoice #173" and response time is logged as 1m30s
    Then Tasks completed increments to 13
    And Avg. response time recalculates accordingly

  Scenario: Pause button sets agent to Needs Setup and prevents assignment
    Given agent status is Active
    When I click Pause
    Then agent status badge changes to Needs Setup (or Paused based on business rule)
    And Assign Task button is disabled until agent is resumed
    When I resume the agent
    Then Assign Task is re-enabled

Feature: Agent Skills Tab
  As an agent manager
  I want to toggle and add capabilities for an agent
  So that the agent only performs allowed tasks and shows prerequisite statuses

  Background:
    Given I am on the Skills tab for "Accountant Agent"
    And the skills list contains rows:
      | name               | toggle | status           |
      | Invoicing          | off    | Needs Tool       |
      | Reporting          | on     | Enabled          |
      | Expense tracking   | off    | Needs Knowledge  |
      | Client follow-up   | off    | Requires Approval|

  Scenario: Happy Path - Enable a skill that has prerequisites satisfied
    Given "Reporting" is toggled on and status Enabled
    When I toggle "Reporting" off and then on again
    Then the status remains Enabled and the toggle returns to on

  Scenario: Enabling a skill with missing tool prompts to connect tool
    Given "Invoicing" is toggled off and status Needs Tool
    When I toggle "Invoicing" on
    Then a modal appears "Connect a tool to use Invoicing" with options "QuickBooks" and "Xero"
    When I click "QuickBooks"
    Then I am navigated to the Tools tab with QuickBooks connection flow

  Scenario Outline: Skill toggles update status based on prerequisites
    Given a skill "<skill>" with initial status "<initial_status>"
    When I toggle the skill on
    Then the resulting status should be "<result_status>"

    Examples:
      | skill             | initial_status   | result_status    |
      | Expense tracking  | Needs Knowledge  | Needs Knowledge  |
      | Client follow-up  | Requires Approval| Requires Approval|
      | Reporting         | Enabled          | Enabled          |

  Scenario: Add capability - New capability appears with default status Needs Knowledge
    Given I click "Add capability"
    When I enter Name "Bank Reconciliation" and click Save
    Then "Bank Reconciliation" appears in the skill rows with toggle off and status "Needs Knowledge"

Feature: Agent Tools Tab
  As an admin
  I want to manage tool integrations and access levels per agent
  So that agents have appropriate access for tasks

  Background:
    Given I am on the Tools tab for "Accountant Agent"
    And tools displayed include QuickBooks (Disconnected), Xero (Connected, Read & Write), Email (Connected, Read-only), Telegram (Disconnected)

  Scenario: Happy Path - Connect a disconnected tool (QuickBooks) and set access levels
    Given QuickBooks shows a "Connect QuickBooks" button
    When I click "Connect QuickBooks" and complete the OAuth flow for QuickBooks
    Then QuickBooks shows status Connected with a "Manage Access" button
    And access level defaults to "Read & Write"
    And the agent's tool count increments by 1

  Scenario: Manage Access - Change access level for a connected tool
    Given Xero is Connected with access "Read & Write"
    When I click "Manage Access" on Xero and change access to "Read-only" and save
    Then Xero shows access level "Read-only"
    And a confirmation toast "Access level updated" is displayed

  Scenario: Disconnect tool with dependent skills warning
    Given Email is Connected and skills "Client follow-up" relies on Email
    When I click Disconnect on Email
    Then a warning appears "Disconnecting Email will set Client follow-up to Needs Tool. Continue?"
    When I confirm
    Then Email is disconnected and "Client follow-up" status becomes Needs Tool

  Scenario: Tool list shows integration-specific action buttons
    Given Telegram shows "Connect Telegram" and Xero shows "Manage Access"
    When I click Connect Telegram
    Then the Telegram Integration modal opens (see Telegram Integration feature)
    When I click Manage Access for Xero
    Then the access control panel for Xero opens

Feature: Telegram Integration
  As an admin
  I want to connect a Telegram bot to an agent via a 4-step modal
  So that the agent can send messages to Telegram channels or users

  Background:
    Given I opened the Connect Telegram modal from Agent Tools
    And the modal is at Step 1

  Scenario: Happy Path - Complete all four steps to connect Telegram successfully
    Given Step 1 shows instructions to create a bot via @BotFather and a CTA "I have my Bot Token"
    When I click "I have my Bot Token"
    Then Step 2 appears with fields Bot Username and Bot Token
    When I enter Bot Username "acme_plumbing_bot" and Bot Token "12345:ABC-DEF" and click "Connect Telegram Bot"
    Then I see a yellow warning "Keep your token private"
    And the modal performs verification and shows Step 3 "Telegram bot verified successfully" with a summary card showing Name "Acme Plumbing Bot", Username "acme_plumbing_bot", status Verified
    When I click "Send Test Message"
    Then the modal shows "Test message sent successfully. Check Telegram to confirm."
    When I click Next to Step 4
    Then the modal shows "Telegram connected" with summary status Connected
    When I click Done
    Then the modal closes and Telegram shows as Connected in the Tools tab

  Scenario: Validation - Username must end with 'bot' and token required
    Given I am on Step 2
    When I enter Bot Username "acme_plumbing" (missing 'bot') and Bot Token ""
    And I click "Connect Telegram Bot"
    Then I see validation errors:
      | field        | message                               |
      | Bot Username | "Username must end with 'bot'"        |
      | Bot Token    | "Bot Token is required"               |

  Scenario: Test message failure and retry
    Given Step 3 is displayed with verification success
    When I click "Send Test Message" and the backend returns a 500 error
    Then I see an inline error "Test message failed to send. Retry or check bot token."
    When I click Retry and the send succeeds
    Then the success message "Test message sent successfully" appears

Feature: Agent Knowledge Tab
  As an agent manager
  I want to add and manage knowledge sources for an agent
  So that agents can reference business-specific documents and rules

  Background:
    Given I am on the Knowledge Sources tab for "Accountant Agent"
    And available sources include: Chart of Accounts (Recommended), Tax Rules & Rates (Missing), Past Financial Reports (Connected)

  Scenario: Happy Path - Add a recommended knowledge source and manage a connected source
    Given "Chart of Accounts" shows a Recommended badge and an Add button
    When I click Add beside "Chart of Accounts"
    Then the source becomes Connected with a Manage button
    When I click Manage on "Past Financial Reports"
    Then I see source details and an option to refresh or remove the source

  Scenario: Missing source shows CTA to add and status updates after add
    Given "Tax Rules & Rates" shows status Missing and action "Add"
    When I click Add and complete the steps supplying tax rules file
    Then the status becomes Connected and the agent knowledge count increments

  Scenario: Multiple sources reflected in agent knowledge count
    Given the agent currently has 2 connected sources
    When I add "Client Billing Policies" and "Expense Policy"
    Then the knowledge sources list shows 4 connected sources
    And a summary displays "4 sources connected"

Feature: Agent Memory Tab
  As a knowledge manager
  I want to manage markdown memory files the agent uses
  So that the agent can reference and learn rules, templates, and context

  Background:
    Given I am on the Agent Memory tab for "Accountant Agent"
    And memory view toggle defaults to Categories view
    And memories exist in categories:
      | category         | memory_count | last_learned   |
      | Billing Rules    | 3            | 2026-06-29     |
      | Payroll Rules    | 2            | 2026-06-15     |

  Scenario: Happy Path - Create a new memory entry with AI assist and view in Categories and Timeline
    Given I click "New memory"
    Then a form panel opens with fields Title, Category, Memory text, Related file and a "Help me phrase this" button
    When I enter Title "Late Fee Policy", select Category "Billing Rules", and click "Help me phrase this"
    Then AI provides a draft "Apply 1.5% late fee on invoices overdue by 30 days."
    When I edit to "Apply 1.5% late fee on invoices overdue by 30 calendar days." and click Add memory
    Then the new memory appears under Billing Rules with current timestamp and memory count increments
    When I switch to Timeline view
    Then the new memory appears grouped under today's date with timestamp and category tag "Billing Rules"

  Scenario: Memory file detail - Expand category to list and edit memories using markdown editor
    Given Billing Rules category row shows 4 memories
    When I click Billing Rules to expand
    Then I see each memory entry with rule text, timestamp, and edit and delete icons
    When I click edit on "Late Fee Policy"
    Then a markdown editor opens with the memory text and buttons "Improve with AI", Cancel and Save
    When I click "Improve with AI"
    Then AI suggests a more formal phrasing
    When I click Save
    Then the memory is updated with new text and an edited timestamp is recorded

  Scenario: Validation - Prevent creating memory without title or text
    Given the New memory form is open
    When I leave Title empty and Memory text empty and click Add memory
    Then I see validation errors "Title is required" and "Memory text is required"

  Scenario: Delete memory and confirm removal from timeline and category counts
    Given a memory "Old Tax Note" exists in Payroll Rules
    When I click Delete and confirm
    Then "Old Tax Note" is removed from the Payroll Rules list
    And the Timeline no longer lists that entry
    And the Payroll Rules memory count decreases by 1

Feature: Agent Activity Log Tab
  As an operations manager
  I want to review recent actions by an AI employee
  So that I can audit behavior and troubleshoot issues

  Background:
    Given I am on the Activity Log tab for "Accountant Agent"
    And the log contains entries of varying severities:
      | icon   | description                         | timestamp            |
      | success| "Invoice #173 generated"            | 2026-06-30 10:12Z    |
      | warning| "Knowledge missing: Tax Rules"      | 2026-06-29 14:05Z    |
      | error  | "Draft report failed to generate"   | 2026-06-28 09:30Z    |
      | pending| "Permission requested for QuickBooks"| 2026-06-27 08:00Z    |

  Scenario: Happy Path - View recent actions with correct icons and description text
    Given I see the Activity Log heading "Activity Log — Recent actions by this AI employee"
    When I scan the first page
    Then entries show typed icons: success entries green, warning yellow, error red, pending gray
    And each entry displays description text and relative timestamp
    When I click "See more"
    Then the next page of results is loaded and appended to the list

  Scenario: Empty state - No activity displays a helpful message
    Given the agent has no activity entries
    When I view the Activity Log
    Then I see message "No recent actions by this AI employee" and a suggestion "Assign a task to get started"

  Scenario: Error entry includes remediation link
    Given an error entry "Draft report failed to generate" is visible
    When I expand the entry
    Then I see details including an error code and a remediation link "Retry report generation"
    When I click "Retry report generation"
    Then the system schedules a retry and a pending log entry is created

Feature: Additional: Agent Creation Flow (via Dashboard "Add AI Employee")
  As a team lead
  I want an alternate agent creation flow from the dashboard
  So that I can create a single agent outside the onboarding wizard

  Background:
    Given I am on the AI Team dashboard

  Scenario: Happy Path - Create a single agent from dashboard modal
    When I click "Add AI Employee"
    Then an Agent Creation modal opens with fields Role Template, Name, Short Description
    When I select Role Template "Accountant Agent", enter Name "Accounts Payable Agent" and Description "Handles vendor invoices", and click Create
    Then the new agent appears in the agent grid with status Needs Setup
    And the Team overview updates counts accordingly

  Scenario: Validation - Prevent creating agent with duplicate name
    Given an agent named "Accountant Agent" already exists
    When I attempt to create another agent with Name "Accountant Agent"
    Then I see an inline error "An agent with this name already exists"

```
