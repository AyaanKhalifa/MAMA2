if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then((registration) => {
        registration.update();
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const markInputs = document.querySelectorAll('.mark-input');
    
    // Auto-calculation and formatting logic
    markInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            sanitizeInput(e.target);
            calculateTotals();
        });
        input.addEventListener('blur', (e) => {
            formatInput(e.target);
            calculateTotals();
        });
    });

    function sanitizeInput(input) {
        let valStr = input.value.trim();
        if (valStr === '') return;

        let upper = valStr.toUpperCase();
        // Allow user typing 'A' or 'AB' or 'B'
        if (upper === 'A') {
            input.value = 'A';
            return;
        }
        if (upper === 'AB' || upper === 'B') {
            input.value = 'AB';
            return;
        }

        // Strip any character that is NOT a number (0-9) or decimal point (.)
        let clean = valStr.replace(/[^0-9.]/g, '');

        // Prevent multiple decimal points
        let parts = clean.split('.');
        if (parts.length > 2) {
            clean = parts[0] + '.' + parts.slice(1).join('');
        }

        let num = parseFloat(clean);
        if (!isNaN(num)) {
            if (num > 25) {
                clean = '25';
            }
            if (num < 0) {
                clean = '0';
            }
        }

        input.value = clean;
    }

    function formatInput(input) {
        let valStr = input.value.trim();
        if (valStr === '') return;

        let upper = valStr.toUpperCase();
        if (upper === 'AB' || upper === 'A' || upper === 'B') {
            input.value = 'AB';
        } else {
            let cleanStr = valStr.replace(/[^0-9.]/g, '');
            let val = parseFloat(cleanStr);
            if (!isNaN(val)) {
                if (val < 0) val = 0;
                if (val > 25) val = 25;
                input.value = val;
            } else {
                input.value = '';
            }
        }
    }

    function calculateTotals() {
        for (let i = 1; i <= 4; i++) {
            const inputs = document.querySelectorAll(`.u${i}`);
            let total = 0;
            let hasValue = false;
            let hasFailOrAbsent = false;
            
            inputs.forEach(input => {
                let valStr = input.value.trim();
                
                // Reset state classes
                input.classList.remove('mark-fail', 'mark-pass', 'mark-absent');

                if (valStr !== '') {
                    hasValue = true;
                    let upper = valStr.toUpperCase();
                    
                    if (upper === 'AB') {
                        input.value = 'AB';
                        input.classList.add('mark-absent');
                        hasFailOrAbsent = true;
                    } else if (upper === 'A') {
                        hasFailOrAbsent = true;
                    } else {
                        let cleanStr = valStr.replace(/[^0-9.]/g, '');
                        let val = parseFloat(cleanStr);
                        if (isNaN(val)) {
                            input.value = '';
                        } else {
                            if (val < 0) {
                                val = 0;
                                input.value = 0;
                            }
                            if (val > 25) {
                                val = 25;
                                input.value = 25;
                            }

                            // 8 or less is FAIL, greater than 8 is PASS
                            if (val <= 8) {
                                input.classList.add('mark-fail');
                                hasFailOrAbsent = true;
                            } else {
                                input.classList.add('mark-pass');
                            }
                            total += val;
                        }
                    }
                }
            });

            const totalCell = document.getElementById(`t-u${i}`);
            const percentCell = document.getElementById(`p-u${i}`);
            const resultCell = document.getElementById(`r-u${i}`);

            if (hasValue) {
                totalCell.textContent = total;
                percentCell.textContent = ((total / 175) * 100).toFixed(2);
                if (resultCell) {
                    if (hasFailOrAbsent) {
                        resultCell.textContent = 'FAIL';
                        resultCell.className = 'status-fail';
                    } else {
                        resultCell.textContent = 'PASS';
                        resultCell.className = 'status-pass';
                    }
                }
            } else {
                totalCell.textContent = '';
                percentCell.textContent = '';
                if (resultCell) {
                    resultCell.textContent = '';
                    resultCell.className = '';
                }
            }
        }
    }

    // Fix for inputs printing blank or weirdly formatted: Convert them to static text before capture
    function prepareForExport() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.setAttribute('value', input.value); // ensure the value attribute reflects the current value
        });
    }

    function resetBodyStylesForExport() {
        const origDisplay = document.body.style.display;
        const origPadding = document.body.style.padding;
        document.body.style.display = 'block';
        document.body.style.padding = '0';
        return { origDisplay, origPadding };
    }

    function restoreBodyStyles(styles) {
        document.body.style.display = styles.origDisplay;
        document.body.style.padding = styles.origPadding;
    }

    // PDF Export Configuration (A4 Landscape)
    document.getElementById('btn-pdf').addEventListener('click', () => {
        const element = document.getElementById('result-sheet');
        prepareForExport();
        
        const originalStyles = resetBodyStylesForExport();
        
        const opt = {
            margin:       0,
            filename:     'Student_Result_Unit_Test.pdf',
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
            restoreBodyStyles(originalStyles);
        });
    });

    // Image Export Configuration (A4 Aspect Ratio)
    document.getElementById('btn-img').addEventListener('click', () => {
        const element = document.getElementById('result-sheet');
        prepareForExport();
        
        const originalStyles = resetBodyStylesForExport();
        
        html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#f8f4e6',
            scrollY: 0,
            scrollX: 0
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'Student_Result_Unit_Test.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            restoreBodyStyles(originalStyles);
        });
    });
});
