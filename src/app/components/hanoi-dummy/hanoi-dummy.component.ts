import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { HanoiService } from '../../services/hanoi.service';
import { SolutionStep } from '../../interfaces/solution-step';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-hanoi-dummy',
  templateUrl: './hanoi-dummy.component.html',
  styleUrls: ['./hanoi-dummy.component.scss']
})
export class HanoiDummyComponent implements AfterViewInit {

  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  diskCount: number = 3;
  moves: number = 0;
  towers: number[][] = [[], [], []];
  selectedDisk: number | null = null;
  selectedTowerIndex: number | null = null;
  solutionSteps: SolutionStep[] = [];
  formattedSolution: string[] = [];
  minMoves: number | null = null;
  showSolutionText: boolean = false;
  currentStepIndex: number = 0;
  currentStep: string = '';

  hypotheticalTimes: { disks: number; moves: number; time: string }[] = [];

  constructor(private hanoiService: HanoiService) {
    this.initializeTowers();
    this.calculateHypotheticalTimes();
  }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.draw();
    this.canvas.nativeElement.addEventListener('click', (event) => this.handleCanvasClick(event));
  }

  initializeTowers() {
    this.moves = 0;
    this.towers = [[], [], []];
    for (let i = this.diskCount; i >= 1; i--) {
      this.towers[0].push(i);
    }
    this.draw();
    this.getMinMoves();
  }

  draw() {
    if (!this.ctx) return;

    const { width, height } = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, width, height);

    const towerX = [100, 300, 500];

    for (let i = 0; i < 3; i++) {
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(towerX[i] - 5, height - 100, 10, 100);
    }

    for (let i = 0; i < 3; i++) {
      const tower = this.towers[i];
      for (let j = 0; j < tower.length; j++) {
        const diskSize = tower[j];
        const diskWidth = diskSize * 20;
        const diskHeight = 20;
        this.ctx.fillStyle = this.getDiskColor(diskSize);
        this.ctx.fillRect(towerX[i] - diskWidth / 2, height - (100 + (j + 1) * diskHeight), diskWidth, diskHeight);
      }
    }
  }

  getDiskColor(size: number): string {
    const isSelected = this.selectedDisk === size;
    if (isSelected) {
      return 'orange';
    }
    switch (size) {
      case 1: return 'blue';
      case 2: return 'green';
      case 3: return 'yellow';
      case 4: return 'purple';
      case 5: return 'cyan';
      case 6: return 'magenta';
      case 7: return 'violet';
      case 8: return 'pink';
      default: return 'black';
    }
  }

  handleCanvasClick(event: MouseEvent) {
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - canvasRect.left;

    const towerIndex = this.getTowerIndex(mouseX);

    if (this.selectedDisk === null) {
      if (towerIndex !== null && this.towers[towerIndex].length > 0) {
        this.selectedDisk = this.towers[towerIndex][this.towers[towerIndex].length - 1];
        this.selectedTowerIndex = towerIndex;
        this.draw();
      }
    } else {
      if (towerIndex !== null && this.isValidMove(towerIndex)) {
        this.towers[towerIndex].push(this.selectedDisk);
        this.towers[this.selectedTowerIndex!].pop();
        this.moves++;
        this.selectedDisk = null;
        this.selectedTowerIndex = null;
        this.draw();
      } else {
        alert('You cannot place a larger disk onto a smaller disk');
        this.selectedDisk = null;
        this.selectedTowerIndex = null;
        this.draw();
      }
    }
  }

  getTowerIndex(mouseX: number): number | null {
    const towerX = [100, 300, 500];
    for (let i = 0; i < towerX.length; i++) {
      if (mouseX >= towerX[i] - 20 && mouseX <= towerX[i] + 20) {
        return i;
      }
    }
    return null;
  }

  isValidMove(towerIndex: number): boolean {
    if (this.towers[towerIndex].length === 0) {
      return true;
    }
    const topDisk = this.towers[towerIndex][this.towers[towerIndex].length - 1];
    return this.selectedDisk! < topDisk;
  }

  restart() {
    this.initializeTowers();
    this.draw();
  }

  getMinMoves() {
    this.hanoiService.getMinMoves(this.diskCount).pipe(
      tap((minMoves: number | null) => {
        this.minMoves = minMoves;
      }),
      catchError((error: any) => {
        console.error(error);
        alert('Error getting minimum moves');
        return throwError(() => error);
      })
    ).subscribe();
  }

  showSolution() {
    this.hanoiService.getSolution(this.diskCount).pipe(
      tap((solution: SolutionStep[]) => {
        this.solutionSteps = solution;
        this.formattedSolution = solution.map((step: SolutionStep) => 
          `Move disk ${step.disk} from rod ${step.from} to rod ${step.to}`
        );
        this.currentStepIndex = 0;
        this.currentStep = this.formattedSolution[this.currentStepIndex];
        this.showSolutionText = true;
      }),
      catchError((error: any) => {
        console.error(error);
        alert('Error getting solution');
        return throwError(() => error);
      })
    ).subscribe();
  }
  
  nextStep() {
    if (this.hasNextStep()) {
      this.currentStepIndex++;
      this.currentStep = this.formattedSolution[this.currentStepIndex];
      if (this.currentStepIndex === this.formattedSolution.length - 1) {
        alert('You won!');
      }
    }
  }

  hasNextStep(): boolean {
    return this.currentStepIndex < this.formattedSolution.length - 1;
  }
  

  calculateHypotheticalTimes() {
    const hypotheticalDisks = [10, 5, 20, 50];
    hypotheticalDisks.forEach(disks => {
      this.hanoiService.getMinMoves(disks).pipe(
        tap((minMoves: number) => {
          const timeInSeconds = minMoves;
          const timeInDays = Math.floor(timeInSeconds / (60 * 60 * 24));
          const remainingSeconds = timeInSeconds % (60 * 60 * 24);
          const timeInHours = Math.floor(remainingSeconds / 3600);
          const timeInMinutes = Math.floor((remainingSeconds % 3600) / 60);
          const timeInFinalSeconds = remainingSeconds % 60;

          this.hypotheticalTimes.push({
            disks: disks,
            moves: minMoves,
            time: `${timeInDays} days, ${timeInHours} hours, ${timeInMinutes} minutes, ${timeInFinalSeconds} seconds`
          });
        }),
        catchError((error: any) => {
          console.error(error);
          alert(`Error getting minimum moves for ${disks} disks`);
          return throwError(() => error);
        })
      ).subscribe();
    });
  }
}
