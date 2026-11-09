import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'checklist_screen.dart';
import 'history_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  final String userId;

  const HomeScreen({
    super.key,
    required this.userId,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> pendingJobs = [];
  int totalAssigned = 0;
  int completedCount = 0;
  dynamic selectedJob;
  List<dynamic> adminQuestions = [];
  bool isLoading = true;
  bool isLoadingQuestions = false;
  String errorMessage = '';
  String staffEmail = '';

  @override
  void initState() {
    super.initState();
    _loadStaffInfo();
    fetchData();
  }

  Future<void> _loadStaffInfo() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final email = prefs.getString('staff_user_email') ?? '';
      if (mounted) {
        setState(() {
          staffEmail = email;
        });
      }
    } catch (_) {}
  }

  Future<void> fetchData() async {
    setState(() {
      isLoading = true;
      errorMessage = '';
    });

    final jobsResult = await ApiService.getStaffJobs(widget.userId);

    if (mounted) {
      if (jobsResult['success'] == true) {
        final List<dynamic> all = jobsResult['data'] ?? [];
        totalAssigned = all.length;
        completedCount = all.where((j) => (j['status'] ?? '').toString().toLowerCase() == 'completed').length;

        // STRICTLY FILTER: Only keep jobs that are NOT completed
        pendingJobs = all.where((j) => (j['status'] ?? '').toString().toLowerCase() != 'completed').toList();

        if (pendingJobs.isNotEmpty) {
          if (selectedJob != null) {
            selectedJob = pendingJobs.firstWhere(
              (j) => j['id'] == selectedJob['id'],
              orElse: () => pendingJobs.first,
            );
          } else {
            selectedJob = pendingJobs.first;
          }
        } else {
          selectedJob = null;
        }
      } else {
        errorMessage = jobsResult['error'] ?? 'Unable to sync assigned jobs';
      }

      // Fetch customer-specific questions for the selected active job
      if (selectedJob != null) {
        final custId = selectedJob['customers']?['id']?.toString() ?? selectedJob['customer_id']?.toString();
        final questionsResult = await ApiService.getQuestions(custId);
        if (questionsResult['success'] == true) {
          adminQuestions = questionsResult['data'] ?? [];
        } else {
          adminQuestions = [];
        }
      } else {
        adminQuestions = [];
      }

      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _onSelectJob(dynamic job) async {
    if (selectedJob?['id'] == job['id']) return;
    HapticFeedback.selectionClick();

    setState(() {
      selectedJob = job;
      isLoadingQuestions = true;
    });

    final custId = job['customers']?['id']?.toString() ?? job['customer_id']?.toString();
    final questionsResult = await ApiService.getQuestions(custId);

    if (mounted) {
      setState(() {
        isLoadingQuestions = false;
        if (questionsResult['success'] == true) {
          adminQuestions = questionsResult['data'] ?? [];
        } else {
          adminQuestions = [];
        }
      });
    }
  }

  void _copyToClipboard(String text, String label) {
    if (text.isEmpty) return;
    Clipboard.setData(ClipboardData(text: text));
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text('$label copied to clipboard'),
          ],
        ),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Color _getAvatarColor(String name) {
    const colors = [
      Color(0xFF2563EB), // Blue
      Color(0xFF059669), // Emerald
      Color(0xFF7C3AED), // Violet
      Color(0xFFD97706), // Amber
      Color(0xFFDB2777), // Pink
      Color(0xFF0891B2), // Cyan
    ];
    if (name.isEmpty) return colors[0];
    final code = name.codeUnits.fold(0, (prev, elem) => prev + elem);
    return colors[code % colors.length];
  }

  Future<void> _openChecklist(dynamic job) async {
    HapticFeedback.mediumImpact();
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ChecklistScreen(job: job),
      ),
    );
    if (result == true) {
      fetchData();
    }
  }

  void _openHistory() {
    HapticFeedback.lightImpact();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => HistoryScreen(userId: widget.userId),
      ),
    );
  }

  Future<void> _logout() async {
    HapticFeedback.lightImpact();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Confirm Sign Out', style: AppStyles.title),
        content: const Text(
          'Are you sure you want to end your current session?',
          style: AppStyles.body,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('staff_user_id');

      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeCount = pendingJobs.length;
    final shiftProgress = totalAssigned > 0 ? (completedCount / totalAssigned) : 0.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        titleSpacing: 20,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.border),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.cleaning_services_rounded, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'JaniFlow',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  staffEmail.isNotEmpty ? staffEmail : 'Field Operations',
                  style: AppStyles.caption,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded, color: AppColors.textPrimary, size: 22),
            tooltip: 'Job History',
            onPressed: _openHistory,
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary, size: 22),
            tooltip: 'Sync Data',
            onPressed: fetchData,
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppColors.textSecondary, size: 22),
            tooltip: 'Sign Out',
            onPressed: _logout,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: fetchData,
        child: isLoading
            ? const Center(
                child: SizedBox(
                  width: 28,
                  height: 28,
                  child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2.5),
                ),
              )
            : errorMessage.isNotEmpty
                ? _buildErrorView()
                : SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Shift Progress Metric Strip
                        _buildMetricStrip(totalAssigned, activeCount, completedCount, shiftProgress),

                        const SizedBox(height: 22),

                        // If no pending jobs are left
                        if (pendingJobs.isEmpty)
                          _buildAllCaughtUpView()
                        else ...[
                          // Customer Selection Header
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'ACTIVE CLIENT ASSIGNMENT',
                                style: AppStyles.overline,
                              ),
                              if (pendingJobs.length > 1)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceSubtle,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '${pendingJobs.length} Clients Pending',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),

                          // Customer Selector Dropdown
                          _buildCustomerDropdown(),

                          const SizedBox(height: 18),

                          // Active Work Order Card
                          if (selectedJob != null) ...[
                            _buildSelectedCustomerCard(selectedJob),
                            const SizedBox(height: 18),
                            _buildInspectionChecklistSection(),
                          ],
                        ],

                        const SizedBox(height: 36),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildMetricStrip(int total, int active, int completed, double progress) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppStyles.cardDecoration(radius: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Today\'s Shift Progress', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              Text(
                '$completed of $total Visits (${(progress * 100).round()}%)',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: AppColors.surfaceSubtle,
              valueColor: AlwaysStoppedAnimation<Color>(
                progress == 1.0 ? AppColors.success : AppColors.primary,
              ),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  label: 'Pending Visits',
                  value: '$active',
                  accentColor: AppColors.warning,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: InkWell(
                  onTap: _openHistory,
                  borderRadius: BorderRadius.circular(10),
                  child: _buildMetricTile(
                    label: 'Completed',
                    value: '$completed',
                    accentColor: AppColors.success,
                    showHistoryHint: true,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  label: 'Total Shift',
                  value: '$total',
                  accentColor: AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required String label,
    required String value,
    required Color accentColor,
    bool showHistoryHint = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: accentColor,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (showHistoryHint)
                const Icon(Icons.arrow_forward_ios_rounded, size: 10, color: AppColors.textMuted),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerDropdown() {
    final currentId = selectedJob?['id']?.toString();
    final validSelectedId = pendingJobs.any((j) => j['id']?.toString() == currentId)
        ? currentId
        : (pendingJobs.isNotEmpty ? pendingJobs.first['id']?.toString() : null);

    return Container(
      decoration: AppStyles.cardDecoration(radius: 12),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: validSelectedId,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary, size: 24),
          dropdownColor: Colors.white,
          borderRadius: BorderRadius.circular(12),
          hint: const Text('Select a customer...', style: AppStyles.body),
          items: pendingJobs.map<DropdownMenuItem<String>>((job) {
            final customer = job['customers'] ?? {};
            final name = customer['name'] ?? 'Customer';
            final address = customer['address'] ?? '';
            final avatarColor = _getAvatarColor(name);

            return DropdownMenuItem<String>(
              value: job['id']?.toString(),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: avatarColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      name.isNotEmpty ? name[0].toUpperCase() : 'C',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: avatarColor,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          address.isNotEmpty ? address : 'Assigned Client',
                          style: AppStyles.caption,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
          onChanged: (String? newId) {
            if (newId != null) {
              final target = pendingJobs.firstWhere((j) => j['id']?.toString() == newId);
              _onSelectJob(target);
            }
          },
        ),
      ),
    );
  }

  Widget _buildSelectedCustomerCard(dynamic job) {
    final customer = job['customers'] ?? {};
    final customerName = customer['name'] ?? 'Customer';
    final customerAddress = customer['address'] ?? 'No address provided';
    final customerPhone = customer['phone'] ?? '';
    final customerEmail = customer['email'] ?? '';
    final avatarColor = _getAvatarColor(customerName);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: AppStyles.cardDecoration(radius: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: avatarColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Text(
                  customerName.isNotEmpty ? customerName[0].toUpperCase() : 'C',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: avatarColor,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      customerName,
                      style: AppStyles.header,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    const Text('Assigned Service Location', style: AppStyles.caption),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.warningBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.pending_actions_rounded, size: 12, color: AppColors.warning),
                    SizedBox(width: 4),
                    Text(
                      'Ready',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.warning,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 14),

          // Address with Copy Action
          InkWell(
            onTap: () => _copyToClipboard(customerAddress, 'Address'),
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on_outlined, size: 18, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      customerAddress,
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.3),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSubtle,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Icon(Icons.copy_rounded, size: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
          ),

          // Contact Actions (Phone & Email)
          if (customerPhone.isNotEmpty || customerEmail.isNotEmpty) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                if (customerPhone.isNotEmpty)
                  Expanded(
                    child: InkWell(
                      onTap: () => _copyToClipboard(customerPhone, 'Phone number'),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceSubtle,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.phone_rounded, size: 14, color: AppColors.primary),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                customerPhone,
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const Icon(Icons.copy_rounded, size: 12, color: AppColors.textMuted),
                          ],
                        ),
                      ),
                    ),
                  ),
                if (customerPhone.isNotEmpty && customerEmail.isNotEmpty)
                  const SizedBox(width: 8),
                if (customerEmail.isNotEmpty)
                  Expanded(
                    child: InkWell(
                      onTap: () => _copyToClipboard(customerEmail, 'Email address'),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceSubtle,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.mail_rounded, size: 14, color: AppColors.accent),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                customerEmail,
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const Icon(Icons.copy_rounded, size: 12, color: AppColors.textMuted),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInspectionChecklistSection() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: AppStyles.cardDecoration(radius: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Assigned Inspection Items', style: AppStyles.title),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${adminQuestions.length} Items',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (isLoadingQuestions)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2),
                ),
              ),
            )
          else if (adminQuestions.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Column(
                  children: const [
                    Icon(Icons.checklist_rtl_rounded, size: 36, color: AppColors.textMuted),
                    SizedBox(height: 8),
                    Text(
                      'No specific questions assigned for this customer.',
                      style: AppStyles.caption,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: adminQuestions.length,
              separatorBuilder: (context, index) => const Divider(height: 14, color: AppColors.border),
              itemBuilder: (context, index) {
                final q = adminQuestions[index];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 22,
                      height: 22,
                      margin: const EdgeInsets.only(top: 1),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceSubtle,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${index + 1}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        q['question_text'] ?? '',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textPrimary,
                          height: 1.35,
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),

          const SizedBox(height: 18),

          // Primary CTA Button
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => _openChecklist(selectedJob),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.assignment_turned_in_rounded, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'Start Inspection Checklist (${adminQuestions.length} Items)',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.arrow_forward_rounded, size: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAllCaughtUpView() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      decoration: AppStyles.cardDecoration(radius: 16),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.successBg,
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFA7F3D0), width: 2),
            ),
            child: const Icon(Icons.task_alt_rounded, size: 32, color: AppColors.success),
          ),
          const SizedBox(height: 16),
          const Text('All Caught Up! 🎉', style: AppStyles.header),
          const SizedBox(height: 6),
          const Text(
            'You have zero pending cleaning visits remaining for today. All assigned inspections have been submitted and emailed.',
            textAlign: TextAlign.center,
            style: AppStyles.body,
          ),
          const SizedBox(height: 22),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _openHistory,
              icon: const Icon(Icons.history_rounded, size: 18),
              label: const Text('View Completed Job History', style: TextStyle(fontWeight: FontWeight.w600)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: fetchData,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Refresh & Check for New Tasks', style: TextStyle(fontWeight: FontWeight.w600)),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.textSecondary,
                side: const BorderSide(color: AppColors.borderStrong),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.dangerBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.cloud_off_rounded, size: 36, color: AppColors.danger),
            ),
            const SizedBox(height: 14),
            const Text('Connection Issue', style: AppStyles.title),
            const SizedBox(height: 6),
            Text(errorMessage, textAlign: TextAlign.center, style: AppStyles.body),
            const SizedBox(height: 18),
            ElevatedButton.icon(
              onPressed: fetchData,
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Retry Connection'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
