import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class HistoryScreen extends StatefulWidget {
  final String userId;

  const HistoryScreen({super.key, required this.userId});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<dynamic> completedJobs = [];
  List<dynamic> filteredJobs = [];
  bool isLoading = true;
  String searchQuery = '';
  String errorMessage = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchHistory();
  }

  Future<void> fetchHistory() async {
    setState(() {
      isLoading = true;
      errorMessage = '';
    });

    final result = await ApiService.getStaffJobs(widget.userId);

    if (mounted) {
      setState(() {
        isLoading = false;
        if (result['success'] == true) {
          final List<dynamic> all = result['data'] ?? [];
          completedJobs = all.where((j) => (j['status'] ?? '').toString().toLowerCase() == 'completed').toList();
          _applySearch();
        } else {
          errorMessage = result['error'] ?? 'Failed to load task history';
        }
      });
    }
  }

  void _applySearch() {
    setState(() {
      filteredJobs = completedJobs.where((j) {
        final customer = j['customers'] ?? {};
        final name = (customer['name'] ?? '').toString().toLowerCase();
        final address = (customer['address'] ?? '').toString().toLowerCase();
        final phone = (customer['phone'] ?? '').toString().toLowerCase();
        final q = searchQuery.toLowerCase();
        return q.isEmpty || name.contains(q) || address.contains(q) || phone.contains(q);
      }).toList();
    });
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

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.border),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Completed History',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
                letterSpacing: -0.2,
              ),
            ),
            Text(
              '${completedJobs.length} past reports archived',
              style: AppStyles.caption,
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary, size: 22),
            tooltip: 'Refresh',
            onPressed: fetchHistory,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: fetchHistory,
        child: Column(
          children: [
            // Search Input Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Column(
                children: [
                  TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      searchQuery = val;
                      _applySearch();
                    },
                    style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Search by client, address or phone...',
                      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                      prefixIcon: const Icon(Icons.search_rounded, size: 18, color: AppColors.textMuted),
                      suffixIcon: searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear_rounded, size: 16, color: AppColors.textMuted),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {
                                  searchQuery = '';
                                  _applySearch();
                                });
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: AppColors.surfaceSubtle,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  if (searchQuery.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Found ${filteredJobs.length} matching result(s)',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        InkWell(
                          onTap: () {
                            _searchController.clear();
                            setState(() {
                              searchQuery = '';
                              _applySearch();
                            });
                          },
                          child: const Text('Clear', style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            // Content List
            Expanded(
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
                      : filteredJobs.isEmpty
                          ? _buildEmptyView()
                          : ListView.separated(
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                              itemCount: filteredJobs.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final job = filteredJobs[index];
                                final customer = job['customers'] ?? {};
                                final name = customer['name'] ?? 'Customer';
                                final address = customer['address'] ?? 'No address';
                                final phone = customer['phone'] ?? '';
                                final updatedAt = job['updated_at'] ?? job['created_at'] ?? '';
                                final avatarColor = _getAvatarColor(name);

                                String formattedDate = 'Recently completed';
                                if (updatedAt.isNotEmpty) {
                                  try {
                                    final dt = DateTime.parse(updatedAt);
                                    formattedDate = '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} • ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
                                  } catch (_) {}
                                }

                                return Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: AppStyles.cardDecoration(radius: 14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Top metadata row
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Row(
                                            children: [
                                              const Icon(Icons.schedule_rounded, size: 13, color: AppColors.textMuted),
                                              const SizedBox(width: 4),
                                              Text(
                                                formattedDate,
                                                style: AppStyles.caption,
                                              ),
                                            ],
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: AppColors.successBg,
                                              borderRadius: BorderRadius.circular(12),
                                              border: Border.all(color: const Color(0xFFA7F3D0)),
                                            ),
                                            child: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(Icons.check_circle_rounded, size: 12, color: AppColors.success),
                                                SizedBox(width: 4),
                                                Text(
                                                  'Report Emailed',
                                                  style: TextStyle(
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.w700,
                                                    color: AppColors.success,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),

                                      const SizedBox(height: 12),

                                      // Customer Info with Avatar
                                      Row(
                                        children: [
                                          Container(
                                            width: 36,
                                            height: 36,
                                            decoration: BoxDecoration(
                                              color: avatarColor.withValues(alpha: 0.15),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            alignment: Alignment.center,
                                            child: Text(
                                              name.isNotEmpty ? name[0].toUpperCase() : 'C',
                                              style: TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w800,
                                                color: avatarColor,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  name,
                                                  style: const TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w700,
                                                    color: AppColors.textPrimary,
                                                  ),
                                                ),
                                                const SizedBox(height: 2),
                                                const Text('Cleaning & Inspection Visit', style: AppStyles.caption),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),

                                      const SizedBox(height: 12),
                                      const Divider(height: 1, color: AppColors.border),
                                      const SizedBox(height: 10),

                                      // Address with Copy
                                      InkWell(
                                        onTap: () => _copyToClipboard(address, 'Address'),
                                        borderRadius: BorderRadius.circular(6),
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(vertical: 2),
                                          child: Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              const Icon(Icons.location_on_outlined, size: 15, color: AppColors.textMuted),
                                              const SizedBox(width: 6),
                                              Expanded(
                                                child: Text(
                                                  address,
                                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                                ),
                                              ),
                                              const SizedBox(width: 6),
                                              const Icon(Icons.copy_rounded, size: 12, color: AppColors.textMuted),
                                            ],
                                          ),
                                        ),
                                      ),

                                      if (phone.isNotEmpty) ...[
                                        const SizedBox(height: 6),
                                        InkWell(
                                          onTap: () => _copyToClipboard(phone, 'Phone number'),
                                          borderRadius: BorderRadius.circular(6),
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(vertical: 2),
                                            child: Row(
                                              children: [
                                                const Icon(Icons.phone_outlined, size: 15, color: AppColors.textMuted),
                                                const SizedBox(width: 6),
                                                Expanded(
                                                  child: Text(
                                                    phone,
                                                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                                const SizedBox(width: 6),
                                                const Icon(Icons.copy_rounded, size: 12, color: AppColors.textMuted),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceSubtle,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.history_rounded, size: 36, color: AppColors.textMuted),
            ),
            const SizedBox(height: 14),
            const Text('No Completed Jobs', style: AppStyles.title),
            const SizedBox(height: 6),
            const Text(
              'Completed cleaning tasks will appear here along with generated PDF inspection timestamps.',
              textAlign: TextAlign.center,
              style: AppStyles.body,
            ),
          ],
        ),
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
            const Icon(Icons.error_outline_rounded, size: 40, color: AppColors.textMuted),
            const SizedBox(height: 12),
            Text(errorMessage, textAlign: TextAlign.center, style: AppStyles.body),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: fetchHistory,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}
