import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
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
            answers[q['id'].toString()] = true; // default Yes (satisfactory)
          }
        }
      });
    }
  }

  Future<void> _pickImage(String questionId, ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 70,
        maxWidth: 1024,
      );

      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          photoBytes[questionId] = bytes;
        });
      }
    } catch (_) {}
  }

  void _showImageSourcePicker(String questionId) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Material(
          color: Colors.white,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Attach Proof Photo', style: AppStyles.title),
                const SizedBox(height: 4),
                const Text('Photo will be embedded in the PDF inspection report', style: AppStyles.caption),
                const SizedBox(height: 16),
                ListTile(
                  leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primary),
                  title: const Text('Take Photo with Camera', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                  contentPadding: EdgeInsets.zero,
                  onTap: () {
                    Navigator.pop(ctx);
                    _pickImage(questionId, ImageSource.camera);
                  },
                ),
                const Divider(height: 1, color: AppColors.border),
                ListTile(
                  leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
                  title: const Text('Choose from Gallery', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
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
      ),
    );
  }

  Future<void> _confirmAndSubmit() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Submit Inspection', style: AppStyles.title),
        content: const Text(
          'Are you sure all tasks are complete? A formal JaniFlow PDF report with your proof photos will be generated and emailed to the customer and admin.',
          style: AppStyles.body,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Review Again', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Confirm & Send'),
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
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppColors.success, size: 24),
              SizedBox(width: 8),
              Text('Report Sent', style: AppStyles.title),
            ],
          ),
          content: const Text(
            'Inspection completed successfully. The report has been sent to the customer and admin dashboard.',
            style: AppStyles.body,
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context, true);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Done'),
            ),
          ],
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['error'] ?? 'Submission failed'),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final customer = widget.job['customers'] ?? {};
    final customerName = customer['name'] ?? 'Customer';
    final photosAttachedCount = photoBytes.length;

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
            ),
          ],
        ),
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
                    // Top Progress Bar
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        border: Border(bottom: BorderSide(color: AppColors.border)),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Checklist Progress', style: AppStyles.caption),
                                    Text(
                                      '${questions.length} Tasks • $photosAttachedCount Photos',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(4),
                                  child: LinearProgressIndicator(
                                    value: 1.0, // all default completed
                                    backgroundColor: AppColors.surfaceSubtle,
                                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                                    minHeight: 4,
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
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                        itemCount: questions.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final q = questions[index];
                          final qId = q['id'].toString();
                          final isYes = answers[qId] ?? true;
                          final hasPhoto = photoBytes.containsKey(qId);

                          return Container(
                            padding: const EdgeInsets.all(16),
                            decoration: AppStyles.cardDecoration(radius: 12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Item Header
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 22,
                                      height: 22,
                                      decoration: BoxDecoration(
                                        color: AppColors.surfaceSubtle,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        '${index + 1}',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        q['question_text'] ?? '',
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                          height: 1.35,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: 14),

                                // Segmented Yes/No Pill Selector
                                Row(
                                  children: [
                                    Expanded(
                                      child: InkWell(
                                        onTap: () => setState(() => answers[qId] = true),
                                        borderRadius: BorderRadius.circular(8),
                                        child: AnimatedContainer(
                                          duration: const Duration(milliseconds: 150),
                                          padding: const EdgeInsets.symmetric(vertical: 8),
                                          decoration: BoxDecoration(
                                            color: isYes ? AppColors.successBg : AppColors.surfaceSubtle,
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(
                                              color: isYes ? AppColors.success : AppColors.border,
                                              width: isYes ? 1.4 : 1,
                                            ),
                                          ),
                                          child: Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Icon(
                                                Icons.check_circle_rounded,
                                                size: 16,
                                                color: isYes ? AppColors.success : AppColors.textMuted,
                                              ),
                                              const SizedBox(width: 6),
                                              Text(
                                                'Completed',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w600,
                                                  color: isYes ? AppColors.success : AppColors.textSecondary,
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
                                        onTap: () => setState(() => answers[qId] = false),
                                        borderRadius: BorderRadius.circular(8),
                                        child: AnimatedContainer(
                                          duration: const Duration(milliseconds: 150),
                                          padding: const EdgeInsets.symmetric(vertical: 8),
                                          decoration: BoxDecoration(
                                            color: !isYes ? AppColors.dangerBg : AppColors.surfaceSubtle,
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(
                                              color: !isYes ? AppColors.danger : AppColors.border,
                                              width: !isYes ? 1.4 : 1,
                                            ),
                                          ),
                                          child: Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Icon(
                                                Icons.cancel_rounded,
                                                size: 16,
                                                color: !isYes ? AppColors.danger : AppColors.textMuted,
                                              ),
                                              const SizedBox(width: 6),
                                              Text(
                                                'Not Done',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w600,
                                                  color: !isYes ? AppColors.danger : AppColors.textSecondary,
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
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceSubtle,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppColors.border),
                                    ),
                                    child: Row(
                                      children: [
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(6),
                                          child: Image.memory(
                                            photoBytes[qId]!,
                                            width: 52,
                                            height: 52,
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        const Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text('Proof Photo Attached', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                              Text('Included in PDF report', style: AppStyles.caption),
                                            ],
                                          ),
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.refresh_rounded, size: 18, color: AppColors.textSecondary),
                                          tooltip: 'Retake',
                                          onPressed: () => _showImageSourcePicker(qId),
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.danger),
                                          tooltip: 'Remove',
                                          onPressed: () => setState(() => photoBytes.remove(qId)),
                                        ),
                                      ],
                                    ),
                                  )
                                else
                                  InkWell(
                                    onTap: () => _showImageSourcePicker(qId),
                                    borderRadius: BorderRadius.circular(8),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                                      decoration: BoxDecoration(
                                        color: Colors.transparent,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: AppColors.border, style: BorderStyle.solid),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.add_a_photo_outlined, size: 15, color: AppColors.textSecondary),
                                          SizedBox(width: 6),
                                          Text('Attach Photo Proof', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
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
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : const Text(
                                    'Submit & Email Report',
                                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.assignment_turned_in_outlined, size: 44, color: AppColors.textMuted),
            SizedBox(height: 12),
            Text('No Questions Configured', style: AppStyles.title),
            SizedBox(height: 6),
            Text(
              'No inspection checklist items were assigned for this customer.',
              textAlign: TextAlign.center,
              style: AppStyles.caption,
            ),
          ],
        ),
      ),
    );
  }
}
