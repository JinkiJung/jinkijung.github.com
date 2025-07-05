<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { i18nData } from '../../resources/data.js';
    import { language } from '../stores.js';

    let data;
    $: data = i18nData[$language].homePageData.questionGrid;

    // DOM 요소를 바인딩할 변수
    let gridElement;
    let flashlightElement;
    let mainTextElement;
    let textMaskElement;

    // Svelte의 반응성을 활용하도록 텍스트를 변수로 관리
    let mainTitle;
    let mainSubtitle;

    // 비밀 전구 로직을 위한 변수
    let secretQuestion = null; // 전구로 변할 물음표 요소를 저장
    let isSecretFound = false; // 해답을 찾았는지 여부

    const gridSize = 30;
    let questions = [];

    const pastelColors = [
        '#FF5555', '#FF9933', '#FFDD00', '#44D744', 
        '#3399FF', '#9966FF', '#FF66CC', '#99DD44'
    ];

    function updateTextMask() {
        if (!mainTextElement || !textMaskElement) return;
        const rect = mainTextElement.getBoundingClientRect();
        textMaskElement.style.width = `${rect.width}px`;
        textMaskElement.style.height = `${rect.height}px`;
        textMaskElement.style.top = `${mainTextElement.offsetTop}px`;
        textMaskElement.style.left = `${mainTextElement.offsetLeft}px`;
    }

    // 비밀 전구를 클릭했을 때 실행될 함수
    function handleSecretClick(event) {
        // 전구 아이콘일 때, 그리고 아직 해답을 찾지 않았을 때만 실행
        if (event.target.textContent === '💡' && !isSecretFound) {
            isSecretFound = true;
            mainTitle = data.foundTitle;
            mainSubtitle = data.foundSubtitle;
            
            // 전구를 찾으면 더 이상 클릭되지 않도록 클래스 제거
            secretQuestion.classList.remove('clickable');
        }
    }

    $: if (data) {
      // 언어가 변경되거나 데이터가 로드될 때마다 텍스트 업데이트
      mainTitle = data.initialTitle;
      mainSubtitle = data.initialSubtitle;
      isSecretFound = false; // 언어 변경 시 비밀 상태 초기화
      // grid 재생성 (필요하다면)
      if (gridElement) {
        createQuestionGrid();
      }
    }

    function createQuestionGrid() {
        if (!gridElement) return;

        // 상태 초기화
        // mainTitle과 mainSubtitle은 이제 $: data 블록에서 관리되므로 여기서 초기화하지 않음
        isSecretFound = false;
        if(secretQuestion) {
            secretQuestion.removeEventListener('click', handleSecretClick);
        }
        secretQuestion = null;

        const cols = gridSize;
        const rows = Math.round(cols * (window.innerHeight / window.innerWidth));
        
        gridElement.innerHTML = '';
        gridElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        questions = [];

        for (let i = 0; i < cols * rows; i++) {
            const span = document.createElement('span');
            span.textContent = '?';
            gridElement.appendChild(span);
            questions.push(span);
        }

        const numToColor = Math.min(10, questions.length); 
        const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random()); 

        for (let i = 0; i < numToColor; i++) {
            const questionToColor = shuffledQuestions[i];
            const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
            questionToColor.style.color = randomColor; 
        }

        updateTextMask();

        // --- 수정: 텍스트 영역과 가장자리를 제외한 위치에서 비밀 물음표 선택 ---
        const mainTextRect = mainTextElement.getBoundingClientRect();
        const safeAreaQuestions = questions.filter((q, index) => {
            // 조건 1: 텍스트 영역과 겹치지 않는가?
            const r = q.getBoundingClientRect();
            const isOutsideText = r.right < mainTextRect.left || r.left > mainTextRect.right || r.bottom < mainTextRect.top || r.top > mainTextRect.bottom;
            if (!isOutsideText) return false;

            // 조건 2: 가장자리(상하좌우 2줄)에 위치하지 않는가?
            const col = index % cols;
            const row = Math.floor(index / cols);
            const isInBorder = row < 2 || row >= rows - 2 || col < 2 || col >= cols - 2;
            
            return !isInBorder; // 가장자리에 있지 않아야 통과
        });

        if (safeAreaQuestions.length > 0) {
            // 필터링된 물음표 중 하나를 랜덤으로 선택
            secretQuestion = safeAreaQuestions[Math.floor(Math.random() * safeAreaQuestions.length)];
            // 비밀 물음표에 클릭 이벤트 리스너 영구적으로 추가
            secretQuestion.addEventListener('click', handleSecretClick);
        }
    }
    
    function handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        if (flashlightElement) {
            flashlightElement.style.left = `${mouseX}px`;
            flashlightElement.style.top = `${mouseY}px`;
        }

        questions.forEach(span => {
            const rect = span.getBoundingClientRect();
            const spanX = rect.left + rect.width / 2;
            const spanY = rect.top + rect.height / 2;
            const distance = Math.sqrt(Math.pow(mouseX - spanX, 2) + Math.pow(mouseY - spanY, 2));
            const highlightRadius = 150; 
            
            // 비밀 물음표에 대한 특별 처리 추가
            if (span === secretQuestion && !isSecretFound) {
                if (distance < highlightRadius) {
                    span.textContent = '💡';
                    span.classList.add('clickable');
                } else {
                    span.textContent = '?';
                    span.classList.remove('clickable');
                }
            }
            
            if (distance < highlightRadius) {
                span.classList.add('highlight');
                const scale = 1.5 - (distance / highlightRadius) * 0.5;
                const opacity = 1 - (distance / highlightRadius) * 0.5;
                span.style.transform = `scale(${scale})`;
                span.style.opacity = opacity;
            } else {
                span.classList.remove('highlight');
                span.style.transform = 'scale(1)';
                span.style.opacity = '0.5';
            }
        });
    }

    onMount(() => {
        // data가 이미 로드된 경우에만 초기 그리드 생성
        if (data) {
            createQuestionGrid();
        }
        window.addEventListener('resize', createQuestionGrid);
        document.addEventListener('mousemove', handleMouseMove);
        console.log('QuestionGrid component mounted');
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener('resize', createQuestionGrid);
            document.removeEventListener('mousemove', handleMouseMove);
        }
        if (secretQuestion) {
            secretQuestion.removeEventListener('click', handleSecretClick);
        }
    });
</script>

<div class="container">
    <div id="question-grid" bind:this={gridElement}></div>
    <div class="text-mask" bind:this={textMaskElement}></div>

    <!-- 수정: 텍스트를 반응형 변수로 교체 -->
    <div class="main-text" bind:this={mainTextElement}>
        <h1>{mainTitle}</h1>
        <p>{mainSubtitle}</p>
    </div>

    <div id="flashlight" bind:this={flashlightElement}></div>
</div>

<style>
    :global(body), :global(html) {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        font-family: 'Noto Sans KR', sans-serif;
    }

    .container {
        position: relative;
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        color: #fff;
        cursor: none;
    }

    #question-grid {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: grid;
        z-index: 1;
    }

    :global(#question-grid span) {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2vw;
        font-weight: 700;
        color: #444;
        opacity: 0.5;
        transition: all 0.4s ease-out;
        user-select: none;
    }

    :global(#question-grid span.highlight) {
        color: #00aaff;
        opacity: 1;
        transform: scale(1.5);
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
    }

    .main-text {
        position: relative;
        z-index: 10;
        pointer-events: none;
        transition: all 0.5s ease-in-out;
    }

    .main-text h1 {
        font-size: 4vw;
        margin: 0;
        color: rgba(255, 255, 255, 0.8);
    }

    .main-text p {
        font-size: 1.5vw;
        color: rgba(255, 255, 255, 0.6);
    }
    
    #flashlight {
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 60%);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 5;
        transition: background 0.2s;
    }

    .text-mask {
        position: absolute;
        background-color: #1a1a1a;
        z-index: 2;
        pointer-events: none;
    }

    /* 추가: 클릭 가능한 아이콘을 위한 스타일 */
    :global(#question-grid span.clickable) {
        cursor: pointer;
        /* 전구 아이콘이 하이라이트 될 때도 색상이 유지되도록 함 */
        color: #FFDD00 !important; /* 노란색으로 고정 */
        text-shadow: 0 0 20px #FFDD00;
    }
</style>
