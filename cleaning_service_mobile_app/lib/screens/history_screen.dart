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
        final q = searchQuery.toLowerCase();
        return q.isEmpty || name.contains(q) || address.contains(q);
      }).toList();
    });
  }

  void _copyToClipboard(String text, String label) {
    if (text.isEmpty) return;
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label copied to clipboard'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
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
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (val) {
                  searchQuery = val;
                  _applySearch();
                },
                style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Search by customer name or address...',
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
                              padding: const EdgeInsets.all(20),
                              itemCount: filteredJobs.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final job = filteredJobs[index];
                                final customer = job['customers'] ?? {};
                                final name = customer['name'] ?? 'Customer';
                                final address = customer['address'] ?? 'No address';
                                final phone = customer['phone'] ?? '';
                                final updatedAt = job['updated_at'] ?? job['created_at'] ?? '';

                                String formattedDate = 'Recently completed';
                                if (updatedAt.isNotEmpty) {
                                  try {
                                    final dt = DateTime.parse(updatedAt);
                                    formattedDate = '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} • ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
                                  } catch (_) {}
                                }

                                return Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: AppStyles.cardDecoration(radius: 12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Top metadata row
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              formattedDate,
                                              style: AppStyles.caption,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppColors.successBg,
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(Icons.check_rounded, size: 12, color: AppColors.success),
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

                                      const SizedBox(height: 8),

                                      // Customer Name & Job ID
                                      Text(
                                        name,
                                        style: AppStyles.title,
                                      ),

                                      const SizedBox(height: 10),
                                      const Divider(height: 1, color: AppColors.border),
                                      const SizedBox(height: 10),

                                      // Address
                                      InkWell(
                                        onTap: () => _copyToClipboard(address, 'Address'),
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
                                          ],
                                        ),
                                      ),

                                      if (phone.isNotEmpty) ...[
                                        const SizedBox(height: 6),
                                        InkWell(
                                          onTap: () => _copyToClipboard(phone, 'Phone number'),
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
                                            ],
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
          children: const [
            Icon(Icons.history_rounded, size: 40, color: AppColors.textMuted),
            SizedBox(height: 12),
            Text('No Completed Jobs', style: AppStyles.title),
            SizedBox(height: 4),
            Text(
              'Completed cleaning tasks will appear here along with PDF report timestamps.',
              textAlign: TextAlign.center,
              style: AppStyles.caption,
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
            OutlinedButton(
              onPressed: fetchHistory,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.border),
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}

