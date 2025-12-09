# QPerform User Training Guide

**Version:** 1.0
**Last Updated:** December 9, 2025
**Application:** QPerform Performance Management System

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Logging In](#logging-in)
5. [Dashboard Overview](#dashboard-overview)
6. [Viewing Performance Data](#viewing-performance-data)
7. [Understanding Performance Scores](#understanding-performance-scores)
8. [Identifying At-Risk Agents](#identifying-at-risk-agents)
9. [Taking Corrective Actions](#taking-corrective-actions)
10. [Viewing Action Recommendations](#viewing-action-recommendations)
11. [Action Log Management](#action-log-management)
12. [Monthly Summary Reports](#monthly-summary-reports)
13. [Using Filters](#using-filters)
14. [Switching Between Production & QA Metrics](#switching-between-production--qa-metrics)
15. [Best Practices](#best-practices)
16. [FAQs](#faqs)

---

## Introduction

### What is QPerform?

QPerform is OnQ's performance management system designed to help supervisors, managers, and directors track agent performance, identify underperformers, and take appropriate corrective actions based on company policies.

### Key Features

- **Real-time Performance Tracking** - View agent QA and Production scores
- **At-Risk Detection** - Automatic identification of agents at risk of termination
- **Smart Recommendations** - Automated suggestions for corrective actions (Cases A-E)
- **Warning Tracking** - Monitor verbal and written warnings with automatic expiration
- **Action Logging** - Document all corrective actions taken
- **Monthly Reports** - Comprehensive performance summaries

---

## Getting Started

### System Requirements

- **Browser:** Chrome, Edge, Firefox, or Safari (latest version)
- **Internet Connection:** Stable internet required
- **Account:** OnQ Microsoft 365 account
- **Permissions:** Access granted by IT/HR based on your role

### Who Should Use QPerform?

- **Team Leads/Supervisors:** Monitor direct reports
- **Managers:** Oversee team performance
- **Directors:** Department-level analytics
- **AVPs:** Organization-wide visibility
- **HR Personnel:** Performance documentation and compliance

---

## User Roles & Permissions

### Role Overview

| Role | View All Agents | Take Actions | View Reports | Access Level |
|------|----------------|--------------|--------------|--------------|
| **AVP** | ✅ Yes | ✅ Yes | ✅ Yes | All clients/departments |
| **Director** | ✅ Yes | ✅ Yes | ✅ Yes | All clients/departments |
| **Manager** | ⚠️ Limited | ✅ Yes | ✅ Yes | Assigned clients only |
| **Assistant Manager** | ⚠️ Limited | ✅ Yes | ✅ Yes | Assigned clients only |
| **Supervisor** | ⚠️ Limited | ✅ Yes | ⚠️ Limited | Direct reports only |
| **Team Lead** | ⚠️ Limited | ✅ Yes | ⚠️ Limited | Direct reports only |
| **Agent** | ❌ No | ❌ No | ⚠️ Own data | Own performance only |

---

## Logging In

### Step-by-Step Login Process

1. **Navigate to QPerform**
   - Open your web browser
   - Go to: `https://qperform.yourcompany.com`

2. **Welcome Screen**
   - You'll see the QPerform welcome screen with the OnQ logo
   - Click the **"Sign in with Microsoft"** button

3. **Microsoft Authentication**
   - You'll be redirected to Microsoft's login page
   - Enter your OnQ email address (e.g., `john.smith@onqfinancial.com`)
   - Enter your password
   - Complete any 2-factor authentication if required

4. **Access Verification**
   - QPerform will verify your access permissions
   - If authorized, you'll be redirected to the Performance Dashboard
   - If unauthorized, you'll see an "Access Denied" message

### First-Time Login

If this is your first time logging in:
- Contact your IT administrator to ensure your account has been granted access
- Verify your role is correctly configured in the system
- Review this training guide before using the application

---

## Dashboard Overview

### Main Navigation

After logging in, you'll see the main navigation menu:

```
┌─────────────────────────────────────────────┐
│  [OnQ Logo]  QPerform    [Your Name ▾]     │
├─────────────────────────────────────────────┤
│  Underperforming  │  Summary  │  Action Log │
└─────────────────────────────────────────────┘
```

**Three Main Sections:**

1. **Underperforming** - Performance grid showing all agents and their weekly scores
2. **Summary** - Monthly performance summaries by client and category
3. **Action Log** - Complete history of all corrective actions taken

### Header Information

The header shows:
- **OnQ Logo** - Click to return to welcome screen
- **Current View** - Which section you're viewing
- **Your Name** - Your logged-in account
- **Logout Button** - Click your name to access logout option

---

## Viewing Performance Data

### The Performance Grid

The **Underperforming** view shows a grid with:

**Vertical Axis (Rows):** Agent names
**Horizontal Axis (Columns):** Calendar weeks

Each cell shows the agent's performance score for that week.

### Reading the Grid

```
┌───────────────┬──────────┬──────────┬──────────┬──────────┐
│ Agent         │ Week 1   │ Week 2   │ Week 3   │ Week 4   │
│               │ 12/1-7   │ 12/8-14  │ 12/15-21 │ 12/22-28 │
├───────────────┼──────────┼──────────┼──────────┼──────────┤
│ John Smith    │  98.5%   │  97.2%   │  99.1%   │  100%    │
│               │  [Green] │  [Orange]│  [Yellow]│  [Green] │
├───────────────┼──────────┼──────────┼──────────┼──────────┤
│ Jane Doe      │  96.1%   │  95.8%   │  96.5%   │  97.5%   │
│  ⚠️ AT RISK   │  [Red]   │  [Red]   │  [Red]   │  [Orange]│
└───────────────┴──────────┴──────────┴──────────┴──────────┘
```

### Agent Information Panel

On the left side of the grid, you'll see:
- **Agent Name** - Full name of the employee
- **Email Address** - Agent's email
- **At-Risk Badge** - If the agent is at risk of termination
- **Action Buttons** - "View Actions" and "Take Action"

---

## Understanding Performance Scores

### 5-Level Color Coding System

QPerform uses a color-coded badge system to quickly identify performance levels:

#### For QA Metrics:

| Color | Level | Score Range | Meaning |
|-------|-------|-------------|---------|
| 🟢 **Green** | Great | ≥ 100% | Exceeding expectations |
| 🟢 **Light Green** | Good | 99-100% | Meeting expectations well |
| 🟡 **Yellow** | Normal | 98-99% | Meeting minimum standards |
| 🟠 **Orange** | Low | 97-98% | Below standards - needs attention |
| 🔴 **Red** | Critical | < 97% | Significantly below standards - action required |

#### For Production Metrics:

| Color | Level | Score Range | Meaning |
|-------|-------|-------------|---------|
| 🟢 **Green** | Great | > 101% | Exceeding expectations |
| 🟢 **Light Green** | Good | 100-101% | Meeting expectations well |
| 🟡 **Yellow** | Normal | 99-100% | Meeting minimum standards |
| 🟠 **Orange** | Low | 98-99% | Below standards - needs attention |
| 🔴 **Red** | Critical | < 98% | Significantly below standards - action required |

### When to Take Action

⚠️ **Action Required:**
- Any **Red (Critical)** score - immediate attention needed
- Multiple **Orange (Low)** scores - coaching recommended
- Three or more underperforming weeks - formal action required

✅ **No Action Needed:**
- **Green** scores - acknowledge good performance
- **Yellow** scores - monitor but no action required yet

---

## Identifying At-Risk Agents

### At-Risk Badge

Agents at risk of termination will have a colored badge next to their name:

```
🚨 CRITICAL - Immediate Action Required
⚠️  HIGH - Urgent Attention Needed
⚠️  MEDIUM - Monitor Closely
ℹ️  LOW - Early Warning
```

### Risk Levels Explained

#### 🚨 CRITICAL (Red Badge)
**What it means:** Agent has 2 or more Written Warnings
**What to do:** One more underperformance could lead to termination. Consult with HR immediately.

#### ⚠️ HIGH (Orange Badge)
**What it means:** Agent has 3 or more consecutive underperforming weeks
**What to do:** Issue appropriate warning per company policy. Consider coaching session.

#### ⚠️ MEDIUM (Yellow Badge)
**What it means:**
- 3 total underperforming weeks in the month, OR
- 1 Written Warning active
**What to do:** Monitor closely. Provide additional coaching and support.

#### ℹ️ LOW (Blue Badge)
**What it means:** Early warning signs of potential underperformance
**What to do:** Have informal conversation. Offer support and resources.

### Viewing At-Risk Details

Click on the at-risk badge to see:
- Specific reasons for at-risk status
- Number of underperforming weeks
- Active warnings
- Recommended actions

---

## Taking Corrective Actions

### When to Take Action

Follow OnQ's progressive discipline policy:
1. First underperformance: **Coaching**
2. Continued underperformance: **Verbal Warning**
3. After 2 Verbal Warnings: **Written Warning**
4. After 2 Written Warnings: **Final Warning / PIP / Termination**

### Step-by-Step: Taking an Action

#### Step 1: Open the Action Dialog

1. Locate the agent in the performance grid
2. Click the **"Take Action"** button next to their name
3. The "Take Action" dialog will open

#### Step 2: Fill Out the Form

**Required Fields:**

1. **Employee**
   - Select the agent from the dropdown
   - Start typing to search
   - The agent you clicked will be pre-selected

2. **Action Date**
   - Date you're taking this action
   - Usually today's date
   - Click the calendar icon to select

3. **Action Type**
   - Choose from dropdown:
     - Coaching
     - Training
     - Counseling
     - Verbal Warning
     - Written Warning
     - Final Warning
     - PIP (Performance Improvement Plan)
     - Termination
     - Other

4. **Warning Category** (for warnings only)
   - Substandard Work - Production
   - Substandard Work - QA
   - Other

5. **Week Range**
   - Select the week this action applies to
   - Choose from recent weeks

6. **Notes/Description**
   - **Minimum 10 characters required**
   - Be specific and professional
   - Include:
     - What the issue was
     - What was discussed
     - What the agent needs to improve
     - Timeline for improvement

7. **Taken By**
   - Your name (the person issuing the action)

#### Step 3: Review Warning Status

The dialog shows the agent's current warning status:
```
Current Warning Status for QA:
- Verbal Warnings: 1 active
- Written Warnings: 0 active
- Next Recommended Action: Issue 2nd Verbal Warning + Coaching
```

⚠️ **Warning Progression Rules:**
- You cannot skip warning levels
- First warning must be Verbal
- After 2 Verbal Warnings, must issue Written Warning
- The system will prevent invalid progressions

#### Step 4: Expiration Date (Auto-Calculated)

The expiration date is automatically calculated based on warning type:
- **Verbal Warning:** 90 days (3 months)
- **Written Warning:** 180 days (6 months)
- **Final Warning:** 365 days (12 months)
- **PIP:** 90 days (3 months)
- **Termination:** Permanent (no expiration)

You can view but not edit this field.

#### Step 5: Submit

1. Review all information for accuracy
2. Click **"Submit"** button
3. Wait for confirmation message
4. Action is now logged and visible in Action Log

### Example: Issuing a Verbal Warning

**Scenario:** Jane Doe has had 3 consecutive underperforming weeks in QA.

**Steps:**
1. Click "Take Action" next to Jane Doe
2. Action Type: Select "Verbal Warning"
3. Warning Category: Select "Substandard Work - QA"
4. Week Range: Select "12/15/2025 - 12/21/2025" (most recent underperforming week)
5. Notes: Enter detailed description:
   ```
   Verbal warning issued for substandard QA performance. Jane has scored
   below 97% for three consecutive weeks (12/1, 12/8, 12/15). We discussed
   the importance of accuracy and attention to detail. Jane acknowledged
   the issues and committed to improvement. We will review progress weekly.
   If performance does not improve to 97% or above within 2 weeks, a second
   verbal warning will be issued.
   ```
6. Taken By: "Sarah Johnson"
7. Click Submit

**Result:**
- Verbal warning logged
- Expires in 90 days (3/15/2026)
- Agent now has 1 active Verbal Warning for QA
- Next underperformance will trigger recommendation for 2nd Verbal Warning

---

## Viewing Action Recommendations

### What are Recommendations?

QPerform's Recommendation Engine analyzes each agent's performance history and suggests the appropriate action based on OnQ policy (Cases A-E).

### Opening Recommendations

1. Click **"View Actions"** button next to an agent's name
2. The Recommendations Dialog opens

### Understanding the Recommendation

The dialog shows:

```
┌─────────────────────────────────────────────────┐
│  Action Recommendation for John Smith          │
├─────────────────────────────────────────────────┤
│  Case: B                                        │
│  ⚠️ CRITICAL: Immediate action required         │
│                                                 │
│  Recommended Action:                            │
│  Issue Written Warning                          │
│                                                 │
│  Priority: Level 2 (High)                       │
│                                                 │
│  Notes:                                         │
│  Agent has 2 active Verbal Warnings and         │
│  continues to underperform. CRITICAL: Escalate  │
│  to Written Warning immediately.                │
│                                                 │
│  Performance Summary:                           │
│  - Compliant Weeks: 1 / 4                      │
│  - Actions Taken: 2                             │
│                                                 │
│  [Close]  [Take Action]                         │
└─────────────────────────────────────────────────┘
```

### The Five Cases (A-E)

#### **Case A:** Agent with 1 Verbal Warning + New Underperformance
- **Recommendation:** Issue 2nd Verbal Warning + Coaching Session
- **Priority:** Medium
- **Critical:** No

#### **Case B:** Agent with 2 Verbal Warnings + New Underperformance
- **Recommendation:** Issue Written Warning
- **Priority:** High
- **Critical:** ⚠️ YES

#### **Case C:** Agent with 2 Written Warnings + New Underperformance
- **Recommendation:** Prepare for Employee Termination
- **Priority:** Highest
- **Critical:** ⚠️ YES
- **Note:** Consult with HR immediately

#### **Case D:** Agent Underperforming 2+ Weeks, No Leadership Action
- **Recommendation:** Director provides Leadership Behavior Report to AVP + Verbal Warning to Leader
- **Target:** Leadership accountability
- **Priority:** High
- **Critical:** ⚠️ YES

#### **Case E:** Leader Fails Procedures 2nd Time
- **Recommendation:** Director provides 2nd Leadership Behavior Report + Written Warning to Leader
- **Target:** Leadership accountability
- **Priority:** Highest
- **Critical:** ⚠️ YES

### Acting on Recommendations

1. Review the recommended action
2. If you agree, click **"Take Action"** button
3. This opens the Take Action dialog with pre-filled information
4. Add your notes and submit

---

## Action Log Management

### Viewing the Action Log

1. Click **"Action Log"** tab in the main navigation
2. See all actions taken across all agents

### Action Log Columns

| Column | Description |
|--------|-------------|
| **Date** | When the action was taken |
| **Agent** | Employee who received the action |
| **Action Type** | Type of action (Coaching, Verbal Warning, etc.) |
| **Category** | What the action was for (Production, QA, Other) |
| **Week** | Which week the action applies to |
| **Taken By** | Manager/Supervisor who issued the action |
| **Status** | Active or Expired |
| **Expiration** | When the warning expires (if applicable) |

### Filtering the Action Log

Use the filter options to:
- View actions by specific agent
- Filter by action type
- See only active warnings
- View actions from specific time period

### Deleting Actions

⚠️ **Caution:** Only delete actions if they were entered in error.

1. Click the trash icon next to the action
2. Confirm deletion
3. Action is permanently removed

**Best Practice:** Never delete legitimate actions. They are part of the employee's record.

---

## Monthly Summary Reports

### Accessing Monthly Summary

1. Click **"Summary"** tab in the main navigation
2. Select month and year from filters

### Understanding the Summary

The summary shows:

**Overall Performance:**
- Total agents (AFTEs)
- Number of underperformers
- Average performance score

**By Client:**
- Performance broken down by each client
- Category breakdowns
- Trends over time

**At-Risk Agents:**
- List of all agents currently at risk
- Risk levels
- Recommended actions

### Exporting Reports

(Feature coming soon)
- Export to Excel
- Export to PDF
- Schedule weekly email reports

---

## Using Filters

### Filter Types

**Month/Year Filters:**
- Select the time period to view
- Default: Current month

**Client Filter:**
- View specific client performance
- Available based on your access level

**Category Filter:**
- Filter by performance category
- E.g., "Data Entry", "Customer Service"

**Task Filter:**
- Filter by specific task type

### Applying Filters

1. Click the **"Filters"** button (funnel icon)
2. Select your filter criteria
3. Click **"Apply"**
4. Grid updates to show filtered data

### Resetting Filters

Click **"Reset Filters"** to return to default view (current month, all clients).

---

## Switching Between Production & QA Metrics

### The Metric Toggle

At the top of the performance grid, you'll see:

```
┌─────────────────────────────────┐
│  Production  │  QA  ← Toggle    │
└─────────────────────────────────┘
```

### How to Switch

1. Click **"Production"** to view production metrics
2. Click **"QA"** to view QA metrics
3. The entire grid updates with the selected metric type

### What Changes When You Toggle

- **Performance Scores:** Different KPI values
- **Color Coding:** Uses different thresholds (QA vs Production)
- **At-Risk Detection:** Calculated separately for each metric
- **Recommendations:** Based on the selected metric category

### Best Practice

- Review **both** Production and QA metrics weekly
- Some agents may perform well in one but poorly in the other
- Take actions specific to the metric that's underperforming

---

## Best Practices

### For Supervisors and Team Leads

1. **Review Weekly**
   - Check performance every Monday for previous week
   - Address any red or orange scores immediately

2. **Document Everything**
   - Always log coaching sessions, even informal ones
   - Be specific in notes - include dates, times, what was discussed

3. **Be Consistent**
   - Apply policies fairly to all team members
   - Don't skip warning levels

4. **Proactive Coaching**
   - Don't wait for 3 underperforming weeks
   - Coach after first underperformance

5. **Follow Recommendations**
   - The system's recommendations align with OnQ policy
   - If you deviate, document why

### For Managers and Directors

1. **Monitor Your Teams**
   - Review at-risk agents daily
   - Ensure supervisors are taking appropriate actions

2. **Leadership Accountability**
   - If a supervisor hasn't taken action on an underperformer, find out why
   - Cases D & E hold leaders accountable

3. **Review Action Log**
   - Audit action logs weekly
   - Ensure proper documentation

4. **Monthly Reports**
   - Review monthly summaries with your team
   - Identify trends and patterns

### Documentation Guidelines

When writing notes for actions, include:

✅ **DO:**
- Be factual and specific
- Include dates and performance scores
- Note what was discussed and agreed upon
- Mention any support/resources offered
- Set clear expectations and timelines

❌ **DON'T:**
- Use emotional or judgmental language
- Include personal opinions
- Make assumptions about intent
- Write anything you wouldn't say to the employee's face

**Example Good Note:**
```
Verbal warning issued on 12/15/2025 for QA performance below 97% for
three consecutive weeks (12/1: 96.2%, 12/8: 95.8%, 12/15: 96.5%). Met
with agent to discuss accuracy issues in data entry. Agent acknowledged
awareness of the errors and committed to double-checking work before
submission. Provided refresher on QA standards document. Agent will
receive additional coaching on Tuesdays for the next 2 weeks. Performance
will be reviewed weekly. If performance does not improve to 97% or above
by 12/29/2025, a second verbal warning will be issued per policy.
```

---

## FAQs

### General Questions

**Q: How often is performance data updated?**
A: Performance data is updated weekly, typically every Monday morning with the previous week's results.

**Q: Can I see my own performance?**
A: Yes, agents can view their own performance data but cannot see other agents' data.

**Q: What if I disagree with a performance score?**
A: Contact your supervisor to discuss. Performance scores come from the backend system and reflect actual work output.

### Access & Permissions

**Q: I can't see certain clients. Why?**
A: Access is role-based. Managers and below can only see their assigned clients. Contact your director if you need access to additional clients.

**Q: Can I delete an action I took by mistake?**
A: Yes, you can delete actions through the Action Log. However, only delete actions that were entered in error, not legitimate actions.

**Q: Who can see the actions I take?**
A: Actions are visible to:
- The person who took the action
- The agent's supervisors
- Managers, Directors, and AVPs with access to that client

### Warnings & Expiration

**Q: What happens when a warning expires?**
A: Expired warnings are no longer "active" and don't count toward the agent's warning progression. However, they remain in the action log for historical records.

**Q: Can I extend a warning expiration date?**
A: No, expiration dates are set by company policy and cannot be manually changed. If new performance issues arise, issue a new warning.

**Q: If an agent has an expired Verbal Warning and underperforms again, do I start over?**
A: Yes, expired warnings don't count. You would issue a new first Verbal Warning.

### Recommendations

**Q: Do I have to follow the system's recommendations?**
A: Recommendations are based on OnQ policy and best practices. While not mandatory, deviating from recommendations should be documented with a clear business reason.

**Q: What if the recommendation seems too harsh?**
A: The recommendations follow progressive discipline policy. If you believe there are extenuating circumstances, consult with your manager or HR before taking action.

**Q: Can I issue a Written Warning without 2 Verbal Warnings first?**
A: No, the system enforces proper warning progression. You cannot skip levels except in cases of gross misconduct (which should be handled through HR, not this system).

### Technical Issues

**Q: The page won't load. What do I do?**
A:
1. Refresh the page (F5 or Ctrl+R)
2. Clear your browser cache
3. Try a different browser
4. Contact IT support if the issue persists

**Q: I can't log in.**
A:
1. Verify you're using your OnQ Microsoft account
2. Check that your account has been granted access to QPerform
3. Contact IT to verify your role is correctly configured

**Q: Data looks wrong or outdated.**
A:
1. Check the selected month/year filters
2. Try refreshing the page
3. Verify you have the correct metric toggle selected (Production vs QA)
4. Contact your manager if data still appears incorrect

### At-Risk Badges

**Q: An agent has an at-risk badge but hasn't had 3 underperforming weeks. Why?**
A: At-risk status can be triggered by:
- 3 consecutive underperforming weeks, OR
- 3 total underperforming weeks in the month, OR
- Active written warnings
Click the badge to see the specific reasons.

**Q: How do I remove an at-risk badge?**
A: You don't manually remove badges. They update automatically based on:
- Agent's performance improving
- Warnings expiring
- Moving to a new month

---

## Need Help?

### Technical Support
- **Email:** support@qsoftware.cloud
- **Phone:** (555) 123-4567
- **Hours:** Monday-Friday, 8AM-5PM PST

### Training & Questions
- **Manager:** Contact your direct supervisor
- **HR:** Contact HR department for policy questions
- **IT:** Contact IT for access and technical issues

### Feedback
We welcome your feedback on QPerform!
- **Feature Requests:** Submit through the Help menu
- **Bug Reports:** Email support@qsoftware.cloud
- **Training Requests:** Contact your manager

---

## Quick Reference Card

### Color Codes
- 🔴 Red (Critical): < 97% QA or < 98% Production → Action Required
- 🟠 Orange (Low): 97-98% QA or 98-99% Production → Coaching Needed
- 🟡 Yellow (Normal): 98-99% QA or 99-100% Production → Meeting Standards
- 🟢 Light Green (Good): 99-100% QA or 100-101% Production → Above Standards
- 🟢 Green (Great): ≥ 100% QA or > 101% Production → Excellent

### Warning Progression
1. Coaching (informal)
2. Verbal Warning #1 (expires in 90 days)
3. Verbal Warning #2 (expires in 90 days)
4. Written Warning (expires in 180 days)
5. Final Warning / PIP (expires in 365 days / 90 days)
6. Termination (permanent)

### At-Risk Levels
- 🚨 **CRITICAL:** 2+ Written Warnings
- ⚠️ **HIGH:** 3+ consecutive underperforming weeks
- ⚠️ **MEDIUM:** 3 total weeks OR 1 Written Warning
- ℹ️ **LOW:** Early warning signs

### Key Actions
- **View Actions:** See recommended actions for an agent
- **Take Action:** Log coaching, warnings, or other actions
- **Toggle Metric:** Switch between Production and QA views
- **Filter:** Narrow down data by month, client, category

---

**Document Version:** 1.0
**For Training Videos:** Contact your manager for access to video tutorials
**Print-Friendly Version:** File > Print or Ctrl+P
