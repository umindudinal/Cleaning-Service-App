import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ChecklistScreen extends StatefulWidget {
  final dynamic job;

  const ChecklistScreen({super.key, required this.job});

  @override
  State<ChecklistScreen> createState() => _ChecklistScreenState();
}

class _ChecklistScreenState extends State<ChecklistScreen> {
  List<dynamic> questions = [];
  Map<String, bool> answers = {};
  Map<String, Uint8List> photoBytes = {};

  bool isLoading = true;
  bool isSubmitting = false;
  String currentFilter = 'ALL'; // 'ALL', 'DONE', 'PENDING', 'PHOTOS'
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    fetchQuestions();
  }

  Future<void> fetchQuestions() async {
    final customerId = widget.job['customers']?['id']?.toString() ?? widget.job['customer_id']?.toString();
    final result = await ApiService.getQuestions(customerId);

    if (mounted) {
      setState(() {
        isLoading = false;
        if (result['success'] == true) {
          questions = result['data'] ?? [];
          for (var q in questions) {
            answers[q['id'].toString()] = true; // default Completed (satisfactory)
          }
        }
      });
    }
  }

  Future<void> _pickImage(String questionId, ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 75,
        maxWidth: 1200,
      );

      if (image != null) {
        final bytes = await image.readAsBytes();
        HapticFeedback.mediumImpact();
        setState(() {
          photoBytes[questionId] = bytes;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text('Proof photo attached successfully'),
                ],
              ),
              backgroundColor: AppColors.success,
              duration: const Duration(seconds: 2),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load image: $e'),
            backgroundColor: AppColors.danger,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    }
  }

  void _showImageSourcePicker(String questionId) {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Attach Proof Photo', style: AppStyles.title),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.textMuted),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              const Text(
                'High-quality photo proofs will be embedded directly in the customer PDF report.',
                style: AppStyles.caption,
              ),
              const SizedBox(height: 18),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: AppColors.primary, size: 22),
                ),
                title: const Text('Take Photo with Camera', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                subtitle: const Text('Capture live job proof on site', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                contentPadding: EdgeInsets.zero,
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(questionId, ImageSource.camera);
                },
              ),
              const Divider(height: 12, color: AppColors.border),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.photo_library_rounded, color: AppColors.accent, size: 22),
                ),
                title: const Text('Choose from Gallery', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                subtitle: const Text('Select an existing photo from device', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                contentPadding: EdgeInsets.zero,
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(questionId, ImageSource.gallery);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showPhotoPreviewDialog(String questionId, String questionTitle) {
    final imageBytes = photoBytes[questionId];
    if (imageBytes == null) return;

    HapticFeedback.lightImpact();
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            boxShadow: AppStyles.cardShadow,
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                color: Colors.white,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.successBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.verified_rounded, size: 16, color: AppColors.success),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Proof Photo Preview', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                          Text(questionTitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppStyles.caption),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.textSecondary),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.border),

              // Interactive Image Viewer
              Container(
                color: Colors.black,
                constraints: const BoxConstraints(maxHeight: 380),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    InteractiveViewer(
                      panEnabled: true,
                      minScale: 0.8,
                      maxScale: 4.0,
                      child: Image.memory(
                        imageBytes,
                        fit: BoxFit.contain,
                        width: double.infinity,
                      ),
                    ),
                    Positioned(
                      bottom: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'Pinch to zoom',
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Actions Footer
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        setState(() {
                          photoBytes.remove(questionId);
                        });
                        HapticFeedback.mediumImpact();
                      },
                      icon: const Icon(Icons.delete_outline_rounded, size: 16, color: AppColors.danger),
                      label: const Text('Delete Photo', style: TextStyle(color: AppColors.danger, fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFFFCA5A5)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                    const Spacer(),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _showImageSourcePicker(questionId);
                      },
                      icon: const Icon(Icons.camera_alt_rounded, size: 16),
                      label: const Text('Retake', style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _markAll(bool status) {
    HapticFeedback.mediumImpact();
    setState(() {
      for (var q in questions) {
        answers[q['id'].toString()] = status;
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(status ? 'All tasks marked as Completed ✓' : 'All tasks marked as Not Done'),
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Future<void> _confirmAndSubmit() async {
    HapticFeedback.lightImpact();

    final totalTasks = questions.length;
    final completedCount = answers.values.where((v) => v == true).length;
    final notDoneCount = totalTasks - completedCount;
    final photoCount = photoBytes.length;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.send_rounded, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 10),
            const Text('Submit Inspection', style: AppStyles.title),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'A formal JaniFlow PDF inspection report will be generated and emailed directly to the customer and admin portal.',
              style: AppStyles.body,
            ),
            const SizedBox(height: 14),

            // Summary Card inside dialog
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surfaceSubtle,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Tasks Completed', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      Text(
                        '$completedCount of $totalTasks',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.success),
                      ),
                    ],
                  ),
                  if (notDoneCount > 0) ...[
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Tasks Not Done', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                        Text(
                          '$notDoneCount items',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.danger),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Proof Photos Attached', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      Text(
                        '$photoCount photos',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            if (notDoneCount > 0) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.warningBg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.warning),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '$notDoneCount task(s) are marked Not Done. This will be flagged in the report.',
                        style: const TextStyle(fontSize: 11, color: AppColors.warning, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Review Again', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_rounded, size: 16),
                SizedBox(width: 6),
                Text('Confirm & Send', style: TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => isSubmitting = true);

    List<Map<String, dynamic>> formattedAnswers = [];
    for (var q in questions) {
      final qId = q['id'].toString();
      String? base64Photo;
      if (photoBytes.containsKey(qId)) {
        base64Photo = base64Encode(photoBytes[qId]!);
      }

      formattedAnswers.add({
        'questionId': qId,
        'questionText': q['question_text'],
        'answer': answers[qId] ?? false,
        'photoBase64': base64Photo,
      });
    }

    final result = await ApiService.submitJob(widget.job['id'], formattedAnswers);

    setState(() => isSubmitting = false);

    if (result['success'] == true && mounted) {
      HapticFeedback.mediumImpact();
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.successBg,
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFA7F3D0), width: 2),
                ),
                child: const Icon(Icons.check_rounded, color: AppColors.success, size: 36),
              ),
              const SizedBox(height: 18),
              const Text('Inspection Completed!', style: AppStyles.header, textAlign: TextAlign.center),
              const SizedBox(height: 8),
              const Text(
                'The inspection report has been generated, PDF compiled, and automatically emailed to the customer and dashboard.',
                style: AppStyles.body,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    Navigator.pop(context, true);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Done & Return to Jobs', style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text(result['error'] ?? 'Submission failed. Please check network.')),
            ],
          ),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final customer = widget.job['customers'] ?? {};
    final customerName = customer['name'] ?? 'Customer';
    final totalTasks = questions.length;
    final completedCount = answers.values.where((v) => v == true).length;
    final photosAttachedCount = photoBytes.length;
    final progress = totalTasks > 0 ? (completedCount / totalTasks) : 0.0;
    final allCompleted = totalTasks > 0 && completedCount == totalTasks;

    // Filter questions
    final filteredQuestions = questions.where((q) {
      final qId = q['id'].toString();
      final isDone = answers[qId] ?? true;
      final hasPhoto = photoBytes.containsKey(qId);

      if (currentFilter == 'DONE') return isDone;
      if (currentFilter == 'PENDING') return !isDone;
      if (currentFilter == 'PHOTOS') return hasPhoto;
      return true;
    }).toList();

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
              'Inspection Checklist',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
                letterSpacing: -0.2,
              ),
            ),
            Text(
              customerName,
              style: AppStyles.caption,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        actions: [
          if (questions.isNotEmpty)
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert_rounded, color: AppColors.textSecondary),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onSelected: (val) {
                if (val == 'mark_all_done') _markAll(true);
                if (val == 'mark_all_not_done') _markAll(false);
              },
              itemBuilder: (ctx) => [
                const PopupMenuItem(
                  value: 'mark_all_done',
                  child: Row(
                    children: [
                      Icon(Icons.done_all_rounded, size: 18, color: AppColors.success),
                      SizedBox(width: 10),
                      Text('Mark All as Done', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'mark_all_not_done',
                  child: Row(
                    children: [
                      Icon(Icons.remove_done_rounded, size: 18, color: AppColors.danger),
                      SizedBox(width: 10),
                      Text('Mark All as Not Done', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          const SizedBox(width: 6),
        ],
      ),
      body: isLoading
          ? const Center(
              child: SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2.5),
              ),
            )
          : questions.isEmpty
              ? _buildEmptyState()
              : Column(
                  children: [
                    // Sticky Progress & Quick Action Header
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        border: Border(bottom: BorderSide(color: AppColors.border)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    '$completedCount of $totalTasks Completed',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: allCompleted ? AppColors.successBg : AppColors.surfaceSubtle,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: allCompleted ? const Color(0xFFA7F3D0) : AppColors.border),
                                    ),
                                    child: Text(
                                      '${(progress * 100).round()}%',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: allCompleted ? AppColors.success : AppColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  const Icon(Icons.camera_alt_outlined, size: 14, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                  Text(
                                    '$photosAttachedCount Proofs',
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                                  ),
                                ],
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
                                allCompleted ? AppColors.success : AppColors.primary,
                              ),
                              minHeight: 6,
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Quick Filters Row
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                _buildFilterChip('ALL', 'All ($totalTasks)'),
                                const SizedBox(width: 6),
                                _buildFilterChip('DONE', 'Done ($completedCount)'),
                                const SizedBox(width: 6),
                                _buildFilterChip('PENDING', 'Not Done (${totalTasks - completedCount})'),
                                const SizedBox(width: 6),
                                _buildFilterChip('PHOTOS', 'Photos ($photosAttachedCount)'),
                                const SizedBox(width: 12),
                                InkWell(
                                  onTap: () => _markAll(!allCompleted),
                                  borderRadius: BorderRadius.circular(6),
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          allCompleted ? Icons.restart_alt_rounded : Icons.done_all_rounded,
                                          size: 14,
                                          color: AppColors.primary,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          allCompleted ? 'Reset' : 'Mark All Done',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Questions List
                    Expanded(
                      child: filteredQuestions.isEmpty
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(24),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.filter_list_off_rounded, size: 36, color: AppColors.textMuted),
                                    const SizedBox(height: 8),
                                    Text('No tasks match the filter "$currentFilter"', style: AppStyles.caption),
                                    const SizedBox(height: 10),
                                    TextButton(
                                      onPressed: () => setState(() => currentFilter = 'ALL'),
                                      child: const Text('Show All Tasks', style: TextStyle(fontSize: 13, color: AppColors.primary)),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                              itemCount: filteredQuestions.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final q = filteredQuestions[index];
                                final qId = q['id'].toString();
                                final isDone = answers[qId] ?? true;
                                final hasPhoto = photoBytes.containsKey(qId);
                                final originalIndex = questions.indexOf(q);

                                return Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: AppStyles.cardDecoration(
                                    radius: 12,
                                    borderColor: isDone ? AppColors.border : const Color(0xFFFECACA),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Item Header
                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            width: 24,
                                            height: 24,
                                            decoration: BoxDecoration(
                                              color: isDone ? AppColors.surfaceSubtle : AppColors.dangerBg,
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            alignment: Alignment.center,
                                            child: Text(
                                              '${originalIndex + 1}',
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w700,
                                                color: isDone ? AppColors.textSecondary : AppColors.danger,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Text(
                                              q['question_text'] ?? '',
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w600,
                                                color: isDone ? AppColors.textPrimary : const Color(0xFF991B1B),
                                                height: 1.35,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),

                                      const SizedBox(height: 12),

                                      // Segmented Yes/No Pill Selector
                                      Row(
                                        children: [
                                          Expanded(
                                            child: InkWell(
                                              onTap: () {
                                                HapticFeedback.selectionClick();
                                                setState(() => answers[qId] = true);
                                              },
                                              borderRadius: BorderRadius.circular(8),
                                              child: AnimatedContainer(
                                                duration: const Duration(milliseconds: 150),
                                                padding: const EdgeInsets.symmetric(vertical: 9),
                                                decoration: BoxDecoration(
                                                  color: isDone ? AppColors.successBg : AppColors.surfaceSubtle,
                                                  borderRadius: BorderRadius.circular(8),
                                                  border: Border.all(
                                                    color: isDone ? AppColors.success : AppColors.border,
                                                    width: isDone ? 1.4 : 1,
                                                  ),
                                                ),
                                                child: Row(
                                                  mainAxisAlignment: MainAxisAlignment.center,
                                                  children: [
                                                    Icon(
                                                      Icons.check_circle_rounded,
                                                      size: 16,
                                                      color: isDone ? AppColors.success : AppColors.textMuted,
                                                    ),
                                                    const SizedBox(width: 6),
                                                    Text(
                                                      'Completed',
                                                      style: TextStyle(
                                                        fontSize: 12,
                                                        fontWeight: FontWeight.w700,
                                                        color: isDone ? AppColors.success : AppColors.textSecondary,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: InkWell(
                                              onTap: () {
                                                HapticFeedback.selectionClick();
                                                setState(() => answers[qId] = false);
                                              },
                                              borderRadius: BorderRadius.circular(8),
                                              child: AnimatedContainer(
                                                duration: const Duration(milliseconds: 150),
                                                padding: const EdgeInsets.symmetric(vertical: 9),
                                                decoration: BoxDecoration(
                                                  color: !isDone ? AppColors.dangerBg : AppColors.surfaceSubtle,
                                                  borderRadius: BorderRadius.circular(8),
                                                  border: Border.all(
                                                    color: !isDone ? AppColors.danger : AppColors.border,
                                                    width: !isDone ? 1.4 : 1,
                                                  ),
                                                ),
                                                child: Row(
                                                  mainAxisAlignment: MainAxisAlignment.center,
                                                  children: [
                                                    Icon(
                                                      Icons.cancel_rounded,
                                                      size: 16,
                                                      color: !isDone ? AppColors.danger : AppColors.textMuted,
                                                    ),
                                                    const SizedBox(width: 6),
                                                    Text(
                                                      'Not Done',
                                                      style: TextStyle(
                                                        fontSize: 12,
                                                        fontWeight: FontWeight.w700,
                                                        color: !isDone ? AppColors.danger : AppColors.textSecondary,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),

                                      const SizedBox(height: 12),

                                      // Photo Proof Block
                                      if (hasPhoto)
                                        Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: AppColors.surfaceSubtle,
                                            borderRadius: BorderRadius.circular(10),
                                            border: Border.all(color: AppColors.border),
                                          ),
                                          child: Row(
                                            children: [
                                              GestureDetector(
                                                onTap: () => _showPhotoPreviewDialog(qId, q['question_text'] ?? ''),
                                                child: Stack(
                                                  children: [
                                                    ClipRRect(
                                                      borderRadius: BorderRadius.circular(8),
                                                      child: Image.memory(
                                                        photoBytes[qId]!,
                                                        width: 58,
                                                        height: 58,
                                                        fit: BoxFit.cover,
                                                      ),
                                                    ),
                                                    Positioned(
                                                      right: 2,
                                                      bottom: 2,
                                                      child: Container(
                                                        padding: const EdgeInsets.all(2),
                                                        decoration: BoxDecoration(
                                                          color: Colors.black.withValues(alpha: 0.6),
                                                          shape: BoxShape.circle,
                                                        ),
                                                        child: const Icon(Icons.zoom_in_rounded, size: 12, color: Colors.white),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: GestureDetector(
                                                  onTap: () => _showPhotoPreviewDialog(qId, q['question_text'] ?? ''),
                                                  child: const Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Text(
                                                        'Proof Photo Attached',
                                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                                      ),
                                                      SizedBox(height: 2),
                                                      Text('Tap to zoom & preview', style: AppStyles.caption),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                              IconButton(
                                                icon: const Icon(Icons.refresh_rounded, size: 20, color: AppColors.textSecondary),
                                                tooltip: 'Retake',
                                                onPressed: () => _showImageSourcePicker(qId),
                                              ),
                                              IconButton(
                                                icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.danger),
                                                tooltip: 'Remove',
                                                onPressed: () {
                                                  HapticFeedback.lightImpact();
                                                  setState(() => photoBytes.remove(qId));
                                                },
                                              ),
                                            ],
                                          ),
                                        )
                                      else
                                        InkWell(
                                          onTap: () => _showImageSourcePicker(qId),
                                          borderRadius: BorderRadius.circular(8),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius: BorderRadius.circular(8),
                                              border: Border.all(color: AppColors.borderStrong),
                                            ),
                                            child: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(Icons.add_a_photo_outlined, size: 16, color: AppColors.primary),
                                                SizedBox(width: 6),
                                                Text(
                                                  'Add Photo Proof',
                                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                );
                              },
                            ),
                    ),

                    // Sticky Bottom Submission Bar
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        border: Border(top: BorderSide(color: AppColors.border)),
                      ),
                      child: SafeArea(
                        child: SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: isSubmitting ? null : _confirmAndSubmit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: isSubmitting
                                ? const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SizedBox(
                                        height: 18,
                                        width: 18,
                                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                      ),
                                      SizedBox(width: 12),
                                      Text('Submitting & Sending Report...', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                                    ],
                                  )
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.send_rounded, size: 18),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Submit & Email Report ($completedCount/$totalTasks)',
                                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                                      ),
                                    ],
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = currentFilter == key;
    return InkWell(
      onTap: () {
        HapticFeedback.selectionClick();
        setState(() => currentFilter = key);
      },
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceSubtle,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
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
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.assignment_turned_in_outlined, size: 40, color: AppColors.textMuted),
            ),
            const SizedBox(height: 14),
            const Text('No Questions Configured', style: AppStyles.title),
            const SizedBox(height: 6),
            const Text(
              'No inspection checklist items were assigned for this customer in the admin dashboard.',
              textAlign: TextAlign.center,
              style: AppStyles.body,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Back to Dashboard'),
            ),
          ],
        ),
      ),
    );
  }
}
